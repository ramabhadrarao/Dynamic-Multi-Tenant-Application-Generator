import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Role {
  id: string
  name: string
  description?: string
  active: boolean
  app_id: string
  users?: any[]
  created_at: string
}

const RolesPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles', currentUser?.app_id],
    queryFn: () => api.getRoles(currentUser?.app_id).then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateRole(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setEditingRole(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
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
    const roleData = {
      ...data,
      app_id: currentUser?.app_id,
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, updates: roleData })
    } else {
      createMutation.mutate(roleData)
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setValue('name', role.name)
    setValue('description', role.description)
    setValue('active', role.active)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id)
    }
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setEditingRole(null)
    reset()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Roles</h1>
          <p className="text-secondary-600">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map((role: Role) => (
          <div key={role.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{role.name}</h3>
                    <p className="text-sm text-secondary-500">Role</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <p className="text-secondary-600 mb-4">{role.description}</p>
              <div className="flex items-center text-sm text-secondary-600 mb-4">
                <Users className="w-4 h-4 mr-2" />
                {role.users?.length || 0} users assigned
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  role.active 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {role.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-secondary-500">
                  {new Date(role.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen || !!editingRole}
        onClose={closeModal}
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Role Name *
            </label>
            <input
              {...register('name', { required: 'Role name is required' })}
              className="input"
              placeholder="Administrator"
            />
            {errors.name && (
              <p className="text-sm text-error-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              className="input h-24 resize-none"
              placeholder="Describe the role's responsibilities..."
            />
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
                : editingRole
                ? 'Update Role'
                : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default RolesPage