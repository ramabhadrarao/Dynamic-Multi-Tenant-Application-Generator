import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import DataTable from '../components/DataTable'
import FormRenderer from '../components/FormRenderer'
import Modal from '../components/Modal'
import { ArrowLeft, Plus, Download, Trash2, Edit, Eye } from 'lucide-react'

const FormDataPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filters, setFilters] = useState({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)

  // Fetch form details
  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formId ? api.getForm(formId).then(res => res.data) : null,
    enabled: !!formId,
  })

  // Fetch form fields
  const { data: fields } = useQuery({
    queryKey: ['form-fields', formId],
    queryFn: () => formId ? api.getFormFields(formId).then(res => res.data) : [],
    enabled: !!formId,
  })

  // Fetch form data
  const { data: formDataResponse, isLoading } = useQuery({
    queryKey: ['form-data', formId, page, limit, filters],
    queryFn: () => formId ? api.getFormData(formId, page, limit, filters).then(res => res.data) : null,
    enabled: !!formId,
  })

  // Create form data mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => formId ? api.createFormData(formId, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-data', formId] })
      setIsCreateModalOpen(false)
    },
  })

  // Update form data mutation
  const updateMutation = useMutation({
    mutationFn: (data: { recordId: string; updates: any }) =>
      formId ? api.updateFormData(formId, data.recordId, data.updates) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-data', formId] })
      setIsEditModalOpen(false)
      setSelectedRecord(null)
    },
  })

  // Delete form data mutation
  const deleteMutation = useMutation({
    mutationFn: (recordId: string) =>
      formId ? api.deleteFormData(formId, recordId) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-data', formId] })
    },
  })

  // Generate table columns from form fields
  const columns = React.useMemo(() => {
    if (!fields) return []

    const baseColumns = fields
      .filter((field: any) => field.visible && field.field_type !== 'hidden')
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .slice(0, 6) // Limit to first 6 fields for table display
      .map((field: any) => ({
        key: field.field_name,
        label: field.label,
        sortable: true,
        filterable: true,
        render: (value: any) => {
          if (field.field_type === 'checkbox') {
            return value ? 'Yes' : 'No'
          }
          if (field.field_type === 'date' && value) {
            return new Date(value).toLocaleDateString()
          }
          if (field.field_type === 'dropdown_static' && field.options) {
            try {
              const options = JSON.parse(field.options)
              const option = options.find((opt: any) => opt.value === value)
              return option?.label || value
            } catch (e) {
              return value
            }
          }
          return value || '-'
        }
      }))

    // Add metadata columns
    return [
      ...baseColumns,
      {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
      }
    ]
  }, [fields])

  const handleCreate = (data: any) => {
    createMutation.mutate(data)
  }

  const handleEdit = (record: any) => {
    setSelectedRecord(record)
    setIsEditModalOpen(true)
  }

  const handleUpdate = (data: any) => {
    if (selectedRecord) {
      updateMutation.mutate({
        recordId: selectedRecord.id,
        updates: data
      })
    }
  }

  const handleView = (record: any) => {
    setSelectedRecord(record)
    setIsViewModalOpen(true)
  }

  const handleDelete = (record: any) => {
    if (confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate(record.id)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!formId) return

    try {
      const response = await api.exportFormData(formId, format)
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${form?.name || 'form-data'}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!formId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Form not found
        </h2>
        <button
          onClick={() => navigate('/forms')}
          className="btn-primary"
        >
          Go to Forms
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/forms')}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900">
              {form?.name} - Data
            </h1>
            <p className="text-secondary-600">
              Manage data for this form
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={formDataResponse?.data || []}
        columns={columns}
        loading={isLoading}
        pagination={formDataResponse?.pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onFilter={setFilters}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={() => setIsCreateModalOpen(true)}
        onExport={handleExport}
        searchable
        exportable
        selectable
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Add New ${form?.name} Record`}
        size="lg"
      >
        {fields && (
          <FormRenderer
            fields={fields}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            loading={createMutation.isPending}
            mode="create"
          />
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRecord(null)
        }}
        title={`Edit ${form?.name} Record`}
        size="lg"
      >
        {fields && selectedRecord && (
          <FormRenderer
            fields={fields}
            initialData={selectedRecord}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false)
              setSelectedRecord(null)
            }}
            loading={updateMutation.isPending}
            mode="edit"
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecord(null)
        }}
        title={`View ${form?.name} Record`}
        size="lg"
      >
        {fields && selectedRecord && (
          <FormRenderer
            fields={fields}
            initialData={selectedRecord}
            onSubmit={() => {}} // No-op for view mode
            mode="view"
          />
        )}
      </Modal>
    </div>
  )
}

export default FormDataPage