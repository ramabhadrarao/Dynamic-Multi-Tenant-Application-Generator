import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, Building2, Database, Globe } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Application {
  id: string
  name: string
  code: string
  db_name: string
  description?: string
  domain?: string
  active: boolean
  created_at: string
}

const ApplicationsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const queryClient = useQueryClient()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.getApplications().then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateApplication(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setEditingApp(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const onSubmit = (data: any) => {
    if (editingApp) {
      updateMutation.mutate({ id: editingApp.id, updates: data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (app: Application) => {
    setEditingApp(app)
    setValue('name', app.name)
    setValue('code', app.code)
    setValue('db_name', app.db_name)
    setValue('description', app.description)
    setValue('domain', app.domain)
    setValue('active', app.active)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate(id)
    }
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setEditingApp(null)
    reset()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Applications</h1>
          <p className="text-secondary-600">Manage your multi-tenant applications</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Application
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications?.map((app: Application) => (
          <div key={app.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-6 h-6 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{app.name}</h3>
                    <p className="text-sm text-secondary-500">{app.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(app)}
                    className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <p className="text-secondary-600 mb-4">{app.description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-secondary-600">
                  <Database className="w-4 h-4 mr-2" />
                  {app.db_name}
                </div>
                {app.domain && (
                  <div className="flex items-center text-sm text-secondary-600">
                    <Globe className="w-4 h-4 mr-2" />
                    {app.domain}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  app.active 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {app.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-secondary-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen || !!editingApp}
        onClose={closeModal}
        title={editingApp ? 'Edit Application' : 'Create New Application'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Application Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input"
                placeholder="My Application"
              />
              {errors.name && (
                <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Application Code *
              </label>
              <input
                {...register('code', { required: 'Code is required' })}
                className="input"
                placeholder="my_app"
              />
              {errors.code && (
                <p className="text-sm text-error-600 mt-1">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Database Name *
              </label>
              <input
                {...register('db_name', { required: 'Database name is required' })}
                className="input"
                placeholder="my_app_db"
              />
              {errors.db_name && (
                <p className="text-sm text-error-600 mt-1">{errors.db_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Domain
              </label>
              <input
                {...register('domain')}
                className="input"
                placeholder="myapp.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input h-24 resize-none"
              placeholder="Describe your application..."
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('active')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label className="ml-2 block text-sm text-secondary-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingApp
                ? 'Update Application'
                : 'Create Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ApplicationsPage