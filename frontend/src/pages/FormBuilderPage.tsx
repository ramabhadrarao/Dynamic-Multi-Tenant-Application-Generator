import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import { Save, Eye, ArrowLeft, Plus, Settings, Trash2, GripVertical, Type, Hash, Calendar, CheckSquare, ChevronDown, Upload, Edit3, FileSignature as Signature, EyeOff, Calculator } from 'lucide-react'
import { useForm } from 'react-hook-form'

const fieldTypes = [
  { type: 'textbox', label: 'Text Input', icon: Type },
  { type: 'textarea', label: 'Text Area', icon: Edit3 },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'dropdown_static', label: 'Dropdown', icon: ChevronDown },
  { type: 'file_upload', label: 'File Upload', icon: Upload },
  { type: 'signature', label: 'Signature', icon: Signature },
  { type: 'hidden', label: 'Hidden Field', icon: EyeOff },
  { type: 'calculated', label: 'Calculated', icon: Calculator },
]

interface FormField {
  id: string
  field_name: string
  label: string
  field_type: string
  placeholder?: string
  default_value?: string
  required: boolean
  readonly: boolean
  visible: boolean
  order_index: number
  options?: string
  validation_rules?: string
}

const FormBuilderPage: React.FC = () => {
  const { id: formId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formId ? api.getForm(formId).then(res => res.data) : null,
    enabled: !!formId,
  })

  const { data: fields } = useQuery({
    queryKey: ['form-fields', formId],
    queryFn: () => formId ? api.getFormFields(formId).then(res => res.data) : [],
    enabled: !!formId,
  })

  useEffect(() => {
    if (fields) {
      setFormFields(fields.sort((a: FormField, b: FormField) => a.order_index - b.order_index))
    }
  }, [fields])

  const createFieldMutation = useMutation({
    mutationFn: (data: any) => formId ? api.createFormField(formId, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-fields', formId] })
      setIsFieldModalOpen(false)
      reset()
    },
  })

  const updateFieldMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      api.updateFormField(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-fields', formId] })
      setIsFieldModalOpen(false)
      setSelectedField(null)
      reset()
    },
  })

  const deleteFieldMutation = useMutation({
    mutationFn: (fieldId: string) => api.deleteFormField(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-fields', formId] })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const fieldType = watch('field_type')

  const onSubmit = (data: any) => {
    const fieldData = {
      ...data,
      order_index: selectedField?.order_index || formFields.length,
      options: data.options ? JSON.stringify(data.options.split('\n').map((opt: string) => ({
        value: opt.trim().toLowerCase().replace(/\s+/g, '_'),
        label: opt.trim()
      }))) : undefined,
    }

    if (selectedField) {
      updateFieldMutation.mutate({ id: selectedField.id, updates: fieldData })
    } else {
      createFieldMutation.mutate(fieldData)
    }
  }

  const handleAddField = (type: string) => {
    setSelectedField(null)
    reset()
    setValue('field_type', type)
    setValue('required', false)
    setValue('readonly', false)
    setValue('visible', true)
    setIsFieldModalOpen(true)
  }

  const handleEditField = (field: FormField) => {
    setSelectedField(field)
    setValue('field_name', field.field_name)
    setValue('label', field.label)
    setValue('field_type', field.field_type)
    setValue('placeholder', field.placeholder)
    setValue('default_value', field.default_value)
    setValue('required', field.required)
    setValue('readonly', field.readonly)
    setValue('visible', field.visible)
    
    if (field.options) {
      try {
        const options = JSON.parse(field.options)
        setValue('options', options.map((opt: any) => opt.label).join('\n'))
      } catch (e) {
        setValue('options', '')
      }
    }
    
    setIsFieldModalOpen(true)
  }

  const handleDeleteField = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      deleteFieldMutation.mutate(fieldId)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(formFields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order_index for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index
    }))

    setFormFields(updatedItems)

    // Update each field in the backend
    updatedItems.forEach((field, index) => {
      if (field.order_index !== index) {
        updateFieldMutation.mutate({
          id: field.id,
          updates: { order_index: index }
        })
      }
    })
  }

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.type === type)
    return fieldType?.icon || Type
  }

  const renderPreviewField = (field: FormField) => {
    const commonProps = {
      name: field.field_name,
      placeholder: field.placeholder,
      required: field.required,
      readOnly: field.readonly,
      defaultValue: field.default_value,
      className: "input",
    }

    switch (field.field_type) {
      case 'textarea':
        return <textarea {...commonProps} rows={3} />
      case 'number':
        return <input {...commonProps} type="number" />
      case 'date':
        return <input {...commonProps} type="date" />
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" defaultChecked={field.default_value === 'true'} />
            {field.label}
          </label>
        )
      case 'dropdown_static':
        const options = field.options ? JSON.parse(field.options) : []
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )
      case 'file_upload':
        return <input {...commonProps} type="file" />
      case 'hidden':
        return <input {...commonProps} type="hidden" />
      default:
        return <input {...commonProps} type="text" />
    }
  }

  if (!formId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Create a new form or select an existing one to start building
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
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/forms')}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">
                {form?.name || 'Form Builder'}
              </h1>
              <p className="text-sm text-secondary-600">
                {form?.description || 'Design your form by adding fields'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`btn ${isPreviewMode ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
            <button className="btn-success">
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Field Types Sidebar */}
        {!isPreviewMode && (
          <div className="w-64 bg-white border-r border-secondary-200 p-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-4">Field Types</h3>
            <div className="space-y-2">
              {fieldTypes.map((fieldType) => (
                <button
                  key={fieldType.type}
                  onClick={() => handleAddField(fieldType.type)}
                  className="w-full flex items-center p-3 text-left hover:bg-secondary-50 rounded-lg transition-colors border border-secondary-200 hover:border-primary-300"
                >
                  <fieldType.icon className="w-5 h-5 mr-3 text-secondary-600" />
                  <span className="text-sm text-secondary-900">{fieldType.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isPreviewMode ? (
            /* Preview Mode */
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    {form?.name} - Preview
                  </h2>
                </div>
                <div className="card-content">
                  <form className="space-y-6">
                    {formFields.filter(field => field.visible).map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-error-500 ml-1">*</span>}
                        </label>
                        {renderPreviewField(field)}
                      </div>
                    ))}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" className="btn-secondary">Cancel</button>
                      <button type="submit" className="btn-primary">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Builder Mode */
            <div className="max-w-4xl mx-auto">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-secondary-900">Form Structure</h2>
                </div>
                <div className="card-content">
                  {formFields.length === 0 ? (
                    <div className="text-center py-12">
                      <Plus className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        No fields added yet
                      </h3>
                      <p className="text-secondary-600 mb-4">
                        Start building your form by adding fields from the sidebar
                      </p>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="form-fields">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3"
                          >
                            {formFields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border rounded-lg p-4 bg-white transition-shadow ${
                                      snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="text-secondary-400 hover:text-secondary-600 cursor-grab"
                                        >
                                          <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="p-2 bg-secondary-100 rounded-lg">
                                          {React.createElement(getFieldIcon(field.field_type), {
                                            className: "w-4 h-4 text-secondary-600"
                                          })}
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-secondary-900">
                                            {field.label}
                                          </h4>
                                          <p className="text-sm text-secondary-500">
                                            {field.field_name} • {fieldTypes.find(ft => ft.type === field.field_type)?.label}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {field.required && (
                                          <span className="text-xs bg-error-100 text-error-700 px-2 py-1 rounded">
                                            Required
                                          </span>
                                        )}
                                        {!field.visible && (
                                          <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                                            Hidden
                                          </span>
                                        )}
                                        <button
                                          onClick={() => handleEditField(field)}
                                          className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                          <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteField(field.id)}
                                          className="p-2 text-secondary-600 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration Modal */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false)
          setSelectedField(null)
          reset()
        }}
        title={selectedField ? 'Edit Field' : 'Add Field'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Field Name *
              </label>
              <input
                {...register('field_name', { required: 'Field name is required' })}
                className="input"
                placeholder="first_name"
              />
              {errors.field_name && (
                <p className="text-sm text-error-600 mt-1">{errors.field_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Label *
              </label>
              <input
                {...register('label', { required: 'Label is required' })}
                className="input"
                placeholder="First Name"
              />
              {errors.label && (
                <p className="text-sm text-error-600 mt-1">{errors.label.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Field Type *
            </label>
            <select
              {...register('field_type', { required: 'Field type is required' })}
              className="input"
            >
              <option value="">Select field type</option>
              {fieldTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Placeholder
              </label>
              <input
                {...register('placeholder')}
                className="input"
                placeholder="Enter placeholder text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Default Value
              </label>
              <input
                {...register('default_value')}
                className="input"
                placeholder="Default value"
              />
            </div>
          </div>

          {(fieldType === 'dropdown_static' || fieldType === 'radio') && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                {...register('options')}
                className="input h-24 resize-none"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                {...register('required')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Required
              </label>
            </div>
            <div className="flex items-center">
              <input
                {...register('readonly')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Read Only
              </label>
            </div>
            <div className="flex items-center">
              <input
                {...register('visible')}
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label className="ml-2 block text-sm text-secondary-900">
                Visible
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsFieldModalOpen(false)
                setSelectedField(null)
                reset()
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFieldMutation.isPending || updateFieldMutation.isPending}
              className="btn-primary"
            >
              {createFieldMutation.isPending || updateFieldMutation.isPending
                ? 'Saving...'
                : selectedField
                ? 'Update Field'
                : 'Add Field'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default FormBuilderPage