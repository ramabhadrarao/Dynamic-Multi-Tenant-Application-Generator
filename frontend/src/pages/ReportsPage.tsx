import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { Plus, Edit, Trash2, BarChart3, Eye, Code } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface Report {
  id: string
  name: string
  description?: string
  type: 'builder' | 'custom'
  form_id: string
  app_id: string
  active: boolean
  form?: {
    name: string
    code: string
  }
  columns?: any[]
  filters?: any[]
  created_at: string
}

const ReportsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', currentUser?.app_id],
    queryFn: () => api.getReports(currentUser?.app_id).then(res => res.data),
  })

  const { data: forms } = useQuery({
    queryKey: ['forms', currentUser?.app_id],
    queryFn: () => api.getForms(currentUser?.app_id).then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setIsCreateModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateReport(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setEditingReport(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
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
    const reportData = {
      ...data,
      app_id: currentUser?.app_id,
    }

    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, updates: reportData })
    } else {
      createMutation.mutate(reportData)
    }
  }

  const handleEdit = (report: Report) => {
    setEditingReport(report)
    setValue('name', report.name)
    setValue('description', report.description)
    setValue('type', report.type)
    setValue('form_id', report.form_id)
    setValue('active', report.active)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleBuildReport = (reportId: string) => {
    navigate(`/reports/builder/${reportId}`)
  }

  const handleCreateNew = () => {
    navigate('/reports/builder')
  }

  const closeModal = () => {
    setIsCreateModalOpen(false)
    setEditingReport(null)
    reset()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Reports</h1>
          <p className="text-secondary-600">Create and manage data reports</p>
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
            <BarChart3 className="w-4 h-4 mr-2" />
            Report Builder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports?.map((report: Report) => (
          <div key={report.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${report.type === 'custom' ? 'bg-accent-100' : 'bg-primary-100'}`}>
                    {report.type === 'custom' ? (
                      <Code className="w-5 h-5 text-accent-600" />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-secondary-900">{report.name}</h3>
                    <p className="text-sm text-secondary-500">{report.form?.name}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBuildReport(report.id)}
                    className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit in Builder"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
              <p className="text-secondary-600 mb-4">{report.description}</p>
              <div className="space-y-2 mb-4">
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Form:</span> {report.form?.name}
                </div>
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Columns:</span> {report.columns?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Filters:</span> {report.filters?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">
                  <span className="font-medium">Type:</span> {report.type === 'custom' ? 'Custom' : 'Builder'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  report.active 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-secondary-100 text-secondary-800'
                }`}>
                  {report.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-secondary-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen || !!editingReport}
        onClose={closeModal}
        title={editingReport ? 'Edit Report' : 'Create New Report'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Report Name *
            </label>
            <input
              {...register('name', { required: 'Report name is required' })}
              className="input"
              placeholder="Monthly Sales Report"
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
              placeholder="Describe what this report shows..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Based on Form *
            </label>
            <select
              {...register('form_id', { required: 'Form is required' })}
              className="input"
            >
              <option value="">Select a form</option>
              {forms?.map((form: any) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
            {errors.form_id && (
              <p className="text-sm text-error-600 mt-1">{errors.form_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Report Type
            </label>
            <select
              {...register('type')}
              className="input"
              defaultValue="builder"
            >
              <option value="builder">Builder Report</option>
              <option value="custom">Custom Report (SQL)</option>
            </select>
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
                : editingReport
                ? 'Update Report'
                : 'Create Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ReportsPage