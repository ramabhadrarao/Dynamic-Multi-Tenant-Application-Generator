import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Applications',
      href: '/applications',
      icon: Building2,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Roles',
      href: '/roles',
      icon: Shield,
    },
    {
      name: 'Forms',
      href: '/forms',
      icon: FileText,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: 'Permissions',
      href: '/permissions',
      icon: Layers,
    },
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-secondary-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-secondary-200">
          <Building2 className="w-8 h-8 text-primary-600" />
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-secondary-900">
              Multi-Tenant
            </h1>
            <p className="text-xs text-secondary-500">Generator</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.first_name} {user?.last_name} ({user?.username})
              </p>
              <p className="text-xs text-secondary-500 truncate">
                {user?.role?.name} • {user?.application?.name}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar