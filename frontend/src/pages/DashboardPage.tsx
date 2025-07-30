import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Shield,
  Layers
} from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.getApplications().then(res => res.data),
  })

  const { data: users } = useQuery({
    queryKey: ['users', user?.app_id],
    queryFn: () => api.getUsers(user?.app_id).then(res => res.data),
  })

  const { data: forms } = useQuery({
    queryKey: ['forms', user?.app_id],
    queryFn: () => api.getForms(user?.app_id).then(res => res.data),
  })

  const { data: reports } = useQuery({
    queryKey: ['reports', user?.app_id],
    queryFn: () => api.getReports(user?.app_id).then(res => res.data),
  })

  const stats = [
    {
      name: 'Total Applications',
      value: applications?.length || 0,
      icon: Building2,
      color: 'bg-primary-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Active Users',
      value: users?.filter((u: any) => u.active)?.length || 0,
      icon: Users,
      color: 'bg-success-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Total Forms',
      value: forms?.length || 0,
      icon: FileText,
      color: 'bg-accent-500',
      change: '+23%',
      changeType: 'positive',
    },
    {
      name: 'Reports Created',
      value: reports?.length || 0,
      icon: BarChart3,
      color: 'bg-warning-500',
      change: '+15%',
      changeType: 'positive',
    },
  ]

  const recentActivity = [
    {
      type: 'form',
      action: 'created',
      item: 'User Registration Form',
      time: '2 hours ago',
      icon: FileText,
    },
    {
      type: 'user',
      action: 'added',
      item: 'John Doe',
      time: '4 hours ago',
      icon: Users,
    },
    {
      type: 'report',
      action: 'generated',
      item: 'Monthly Analytics Report',
      time: '6 hours ago',
      icon: BarChart3,
    },
    {
      type: 'permission',
      action: 'updated',
      item: 'Admin Role Permissions',
      time: '1 day ago',
      icon: Shield,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-primary-100 text-lg">
          Here's what's happening with your applications today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
                    <p className={`ml-2 text-sm ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-secondary-100 rounded-lg p-2">
                    <activity.icon className="w-4 h-4 text-secondary-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm text-secondary-900">
                      <span className="font-medium">{activity.item}</span> was {activity.action}
                    </p>
                    <p className="text-xs text-secondary-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-primary text-left p-4 h-auto block">
                <FileText className="w-6 h-6 mb-2" />
                <div>
                  <p className="font-medium">Create Form</p>
                  <p className="text-xs opacity-80">Build a new form</p>
                </div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto block">
                <BarChart3 className="w-6 h-6 mb-2 text-secondary-600" />
                <div>
                  <p className="font-medium text-secondary-900">New Report</p>
                  <p className="text-xs text-secondary-600">Generate insights</p>
                </div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto block">
                <Users className="w-6 h-6 mb-2 text-secondary-600" />
                <div>
                  <p className="font-medium text-secondary-900">Add User</p>
                  <p className="text-xs text-secondary-600">Invite team member</p>
                </div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto block">
                <Building2 className="w-6 h-6 mb-2 text-secondary-600" />
                <div>
                  <p className="font-medium text-secondary-900">New App</p>
                  <p className="text-xs text-secondary-600">Create application</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage