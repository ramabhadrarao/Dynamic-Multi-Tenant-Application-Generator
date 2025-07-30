import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { ArrowLeft, Plus, Settings, Trash2, Eye, Save, Filter } from 'lucide-react'

const ReportBuilderPage: React.FC = () => {
  const { id: reportId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'columns' | 'filters' | 'preview'>('columns')

  const { data: report } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportId ? api.getReport(reportId).then(res => res.data) : null,
    enabled: !!reportId,
  })

  const { data: form } = useQuery({
    queryKey: ['form', report?.form_id],
    queryFn: () => report?.form_id ? api.getForm(report.form_id).then(res => res.data) : null,
    enabled: !!report?.form_id,
  })

  const { data: formFields } = useQuery({
    queryKey: ['form-fields', report?.form_id],
    queryFn: () => report?.form_id ? api.getFormFields(report.form_id).then(res => res.data) : [],
    enabled: !!report?.form_id,
  })

  if (!reportId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-secondary-900 mb-4">
          Create a new report or select an existing one to start building
        </h2>
        <button
          onClick={() => navigate('/reports')}
          className="btn-primary"
        >
          Go to Reports
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
              onClick={() => navigate('/reports')}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-secondary-900">
                {report?.name || 'Report Builder'}
              </h1>
              <p className="text-sm text-secondary-600">
                Based on {form?.name} form
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-success">
              <Save className="w-4 h-4 mr-2" />
              Save Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('columns')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'columns'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Columns
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'filters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Filters
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Preview
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'columns' && (
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900">Report Columns</h2>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Column
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  {formFields?.map((field: any) => (
                    <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" className="h-4 w-4 text-primary-600" />
                        <div>
                          <h4 className="font-medium text-secondary-900">{field.label}</h4>
                          <p className="text-sm text-secondary-500">{field.field_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-secondary-600 hover:text-primary-600">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900">Report Filters</h2>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Filter
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    No filters configured
                  </h3>
                  <p className="text-secondary-600">
                    Add filters to allow users to refine the report data
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-secondary-900">Report Preview</h2>
              </div>
              <div className="card-content">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        {formFields?.slice(0, 5).map((field: any) => (
                          <th key={field.id}>{field.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-secondary-500">
                          No data available - this is a preview
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportBuilderPage