import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, X, Upload, Signature, Eye, EyeOff } from 'lucide-react'

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
  show_if?: string
  hide_if?: string
  options?: string
  validation_rules?: string
}

interface FormRendererProps {
  fields: FormField[]
  initialData?: any
  onSubmit: (data: any) => void
  onCancel?: () => void
  loading?: boolean
  mode?: 'create' | 'edit' | 'view'
}

const FormRenderer: React.FC<FormRendererProps> = ({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState(initialData)
  const [visibleFields, setVisibleFields] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData
  })

  const watchedValues = watch()

  // Sort fields by order_index
  const sortedFields = [...fields].sort((a, b) => a.order_index - b.order_index)

  // Evaluate conditional logic
  useEffect(() => {
    const visible: string[] = []

    sortedFields.forEach(field => {
      let isVisible = field.visible

      // Evaluate show_if condition
      if (field.show_if && isVisible) {
        isVisible = evaluateCondition(field.show_if, watchedValues)
      }

      // Evaluate hide_if condition
      if (field.hide_if && isVisible) {
        isVisible = !evaluateCondition(field.hide_if, watchedValues)
      }

      if (isVisible) {
        visible.push(field.field_name)
      }
    })

    setVisibleFields(visible)
  }, [watchedValues, sortedFields])

  const evaluateCondition = (condition: string, values: any): boolean => {
    try {
      // Simple condition evaluation (can be enhanced with a proper expression parser)
      // Supports: field == 'value', field != 'value', field > 5, etc.
      const conditionRegex = /(\w+)\s*(==|!=|>|<|>=|<=)\s*['"]?([^'"]+)['"]?/
      const match = condition.match(conditionRegex)
      
      if (!match) return true

      const [, fieldName, operator, expectedValue] = match
      const actualValue = values[fieldName]

      switch (operator) {
        case '==':
          return String(actualValue) === String(expectedValue)
        case '!=':
          return String(actualValue) !== String(expectedValue)
        case '>':
          return Number(actualValue) > Number(expectedValue)
        case '<':
          return Number(actualValue) < Number(expectedValue)
        case '>=':
          return Number(actualValue) >= Number(expectedValue)
        case '<=':
          return Number(actualValue) <= Number(expectedValue)
        default:
          return true
      }
    } catch (error) {
      console.warn('Error evaluating condition:', condition, error)
      return true
    }
  }

  const renderField = (field: FormField) => {
    if (!visibleFields.includes(field.field_name)) {
      return null
    }

    const isReadonly = mode === 'view' || field.readonly
    const fieldProps = {
      ...register(field.field_name, {
        required: field.required ? `${field.label} is required` : false,
        validate: field.validation_rules ? validateField(field.validation_rules) : undefined,
      }),
      placeholder: field.placeholder,
      disabled: isReadonly,
      className: `input ${errors[field.field_name] ? 'border-error-500' : ''}`,
    }

    const renderInput = () => {
      switch (field.field_type) {
        case 'textarea':
          return (
            <textarea
              {...fieldProps}
              rows={4}
              className={`${fieldProps.className} resize-none`}
            />
          )

        case 'number':
          return (
            <input
              {...fieldProps}
              type="number"
              step="any"
            />
          )

        case 'date':
          return (
            <input
              {...fieldProps}
              type="date"
            />
          )

        case 'time':
          return (
            <input
              {...fieldProps}
              type="time"
            />
          )

        case 'datetime':
          return (
            <input
              {...fieldProps}
              type="datetime-local"
            />
          )

        case 'checkbox':
          return (
            <label className="flex items-center">
              <input
                {...fieldProps}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mr-2"
              />
              <span className="text-sm text-secondary-900">{field.label}</span>
            </label>
          )

        case 'toggle':
          return (
            <label className="flex items-center">
              <div className="relative">
                <input
                  {...fieldProps}
                  type="checkbox"
                  className="sr-only"
                />
                <div className="block bg-secondary-300 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
              </div>
              <span className="ml-3 text-sm text-secondary-900">{field.label}</span>
            </label>
          )

        case 'dropdown_static':
        case 'dropdown_lookup':
          const options = field.options ? JSON.parse(field.options) : []
          return (
            <select {...fieldProps}>
              <option value="">Select an option</option>
              {options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )

        case 'radio':
          const radioOptions = field.options ? JSON.parse(field.options) : []
          return (
            <div className="space-y-2">
              {radioOptions.map((option: any) => (
                <label key={option.value} className="flex items-center">
                  <input
                    {...fieldProps}
                    type="radio"
                    value={option.value}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 mr-2"
                  />
                  <span className="text-sm text-secondary-900">{option.label}</span>
                </label>
              ))}
            </div>
          )

        case 'file_upload':
          return (
            <div className="flex items-center space-x-3">
              <input
                {...fieldProps}
                type="file"
                className="hidden"
                id={`file-${field.field_name}`}
              />
              <label
                htmlFor={`file-${field.field_name}`}
                className="btn-secondary cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>
              <span className="text-sm text-secondary-600">
                {watchedValues[field.field_name]?.name || 'No file selected'}
              </span>
            </div>
          )

        case 'rich_text':
          return (
            <div className="border border-secondary-300 rounded-lg">
              <div className="border-b border-secondary-200 p-2 bg-secondary-50">
                <div className="flex space-x-2">
                  <button type="button" className="p-1 hover:bg-secondary-200 rounded">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="p-1 hover:bg-secondary-200 rounded">
                    <em>I</em>
                  </button>
                  <button type="button" className="p-1 hover:bg-secondary-200 rounded">
                    <u>U</u>
                  </button>
                </div>
              </div>
              <textarea
                {...fieldProps}
                rows={6}
                className="w-full p-3 border-0 focus:ring-0 resize-none"
              />
            </div>
          )

        case 'signature':
          return (
            <div className="border border-secondary-300 rounded-lg p-4">
              <div className="flex items-center justify-center h-32 bg-secondary-50 rounded border-2 border-dashed border-secondary-300">
                <div className="text-center">
                  <Signature className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600">Click to sign</p>
                </div>
              </div>
            </div>
          )

        case 'hidden':
          return (
            <input
              {...fieldProps}
              type="hidden"
            />
          )

        case 'calculated':
          return (
            <div className="input bg-secondary-50 text-secondary-600">
              {watchedValues[field.field_name] || 'Calculated value will appear here'}
            </div>
          )

        default:
          return (
            <input
              {...fieldProps}
              type="text"
            />
          )
      }
    }

    // Don't render label for checkbox and toggle as they have their own labels
    const showLabel = !['checkbox', 'toggle', 'hidden'].includes(field.field_type)

    return (
      <div key={field.id} className="space-y-2">
        {showLabel && (
          <label className="block text-sm font-medium text-secondary-700">
            {field.label}
            {field.required && <span className="text-error-500 ml-1">*</span>}
            {field.readonly && (
              <span className="ml-2 text-xs text-secondary-500">(Read-only)</span>
            )}
          </label>
        )}
        
        {renderInput()}
        
        {errors[field.field_name] && (
          <p className="text-sm text-error-600">
            {errors[field.field_name]?.message}
          </p>
        )}
      </div>
    )
  }

  const validateField = (rules: string) => {
    return (value: any) => {
      try {
        const rulesObj = JSON.parse(rules)
        
        if (rulesObj.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address'
          }
        }
        
        if (rulesObj.minLength && value.length < rulesObj.minLength) {
          return `Minimum length is ${rulesObj.minLength} characters`
        }
        
        if (rulesObj.maxLength && value.length > rulesObj.maxLength) {
          return `Maximum length is ${rulesObj.maxLength} characters`
        }
        
        if (rulesObj.pattern) {
          const regex = new RegExp(rulesObj.pattern)
          if (!regex.test(value)) {
            return rulesObj.message || 'Invalid format'
          }
        }
        
        return true
      } catch (error) {
        return true
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {sortedFields.map(renderField)}
      
      {mode !== 'view' && (
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </button>
        </div>
      )}
    </form>
  )
}

export default FormRenderer