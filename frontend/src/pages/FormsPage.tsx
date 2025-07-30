import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, FileText, Eye, Code, Database } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Form {
  id: string
  code: string
  name: string
  description?: string
  is_custom: boolean
  parent_form_id?: string
  app_id: string
  table_name?: string
  active: boolean
  fields?: any[]
  created_at: string
}

const FormsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: forms, isLoading } = useQuery({
    queryKey: ['forms', currentUser?.app_id],
    queryFn: () => api.getForms(currentUser?.app_id).then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateForm(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      setEditingForm(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
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
    const formData = {
      ...data,
      app_id: currentUser?.app_id,
    }

    if (editingForm) {
      updateMutation.mutate({ id: editingForm.id, updates: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (form: Form) => {
    setEditingForm(form)
    setValue('code', form.code)
    setValue('name', form.name)
    setValue('description', form.description)
    setValue('is_custom', form.is_custom)
    setValue('table_name', form.table_name)
    setValue('active', form.active)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBuildForm = (formId: string) => {
    navigate(`/forms/builder/${formId}`)
  }

  const handleCreateNew = () => {
    navigate('/forms/builder')
  }

  const handleViewData = (formId: string) => {
    navigate(`/forms/${formId}/data`)
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setEditingForm(null)
    reset()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Forms</h1>
          <p className="text-secondary-600">Create and manage dynamic forms</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </button>
          <button
            onClick={handleCreateNew}
            className="btn-primary"
          >
            <Code className="w-4 h-4 mr-2" />
            Form Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms?.map((form: Form) => (
          <div key={form.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${form.is_custom ? 'bg-accent-100' : 'bg-primary-100'}`}>
                    {form.is_custom ? (
                      <Code className="w-5 h-5 text-accent-600" />
                    ) : (
                    <button
                      onClick={() => handleViewData(form.id)}
                      className="p-2 text-secondary-600 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                      title="View Data"
                    >
                      <Database className="w-4 h-4" />
                    </button>
                      <FileText className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-secondary-900">{form.name}</h3>
                    <p className="text-sm text-secondary-500">{form.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBuildForm(form.id)}
                    className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit in Builder"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <p className="text-secondary-600 mb-4">{form.description}</p>
              <div className="space-y-2 mb-4">
                {form.table_name && (
                  <div className="text-sm text-secondary-600">
                    <span className="font-medium">Table:</span> {form.table_name}
                  </div>
                )}
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Fields:</span> {form.fields?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Type:</span> {form.is_custom ? 'Custom' : 'Builder'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  form.active 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {form.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-secondary-500">
                  {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen || !!editingForm}
        onClose={closeModal}
        title={editingForm ? 'Edit Form' : 'Create New Form'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Form Code *
              </label>
              <input
                {...register('code', { required: 'Form code is required' })}
                className="input"
                placeholder="user_profile"
              />
              {errors.code && (
                <p className="text-sm text-error-600 mt-1">{errors.code.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Form Name *
              </label>
              <input
                {...register('name', { required: 'Form name is required' })}
                className="input"
                placeholder="User Profile"
              />
              {errors.name && (
                <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input h-24 resize-none"
              placeholder="Describe what this form is used for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Table Name
            </label>
            <input
              {...register('table_name')}
              className="input"
              placeholder="user_profiles"
            />
            <p className="text-xs text-secondary-500 mt-1">
              Database table where form data will be stored
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                {...register('is_custom')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Custom Form (with code)
              </label>
            </div>
            <div className="flex items-center">
              <input
                {...register('active')}
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Active
              </label>
            </div>
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
                : editingForm
                ? 'Update Form'
                : 'Create Form'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default FormsPage