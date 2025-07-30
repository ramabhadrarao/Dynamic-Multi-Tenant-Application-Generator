import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, Users, Mail, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  active: boolean
  app_id: string
  role_id?: string
  role?: {
    id: string
    name: string
  }
  created_at: string
}

const UsersPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', currentUser?.app_id],
    queryFn: () => api.getUsers(currentUser?.app_id).then(res => res.data),
  })

  const { data: roles } = useQuery({
    queryKey: ['roles', currentUser?.app_id],
    queryFn: () => api.getRoles(currentUser?.app_id).then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateUser(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditingUser(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
    const userData = {
      ...data,
      app_id: currentUser?.app_id,
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, updates: userData })
    } else {
      createMutation.mutate(userData)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setValue('username', user.username)
    setValue('email', user.email)
    setValue('first_name', user.first_name)
    setValue('last_name', user.last_name)
    setValue('role_id', user.role_id)
    setValue('active', user.active)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id)
    }
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setEditingUser(null)
    reset()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Users</h1>
          <p className="text-secondary-600">Manage users in your application</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: User) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {user.first_name?.[0] || user.username[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-secondary-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-secondary-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-secondary-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-secondary-500" />
                        <span className="text-secondary-900">{user.role?.name || 'No role'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-secondary-100 text-secondary-800'
                      }`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-secondary-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen || !!editingUser}
        onClose={closeModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Username *
              </label>
              <input
                {...register('username', { required: 'Username is required' })}
                className="input"
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="text-sm text-error-600 mt-1">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Email *
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-error-600 mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                First Name
              </label>
              <input
                {...register('first_name')}
                className="input"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Last Name
              </label>
              <input
                {...register('last_name')}
                className="input"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Role
            </label>
            <select {...register('role_id')} className="input">
              <option value="">Select a role</option>
              {roles?.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Password *
              </label>
              <input
                {...register('password', { required: !editingUser && 'Password is required' })}
                type="password"
                className="input"
                placeholder="********"
              />
              {errors.password && (
                <p className="text-sm text-error-600 mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

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
                : editingUser
                ? 'Update User'
                : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsersPage