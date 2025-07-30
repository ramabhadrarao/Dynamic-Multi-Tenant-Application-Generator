import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Users, FileText, BarChart3, Check, X } from 'lucide-react'

const PermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string>('')

  const { data: roles } = useQuery({
    queryKey: ['roles', currentUser?.app_id],
    queryFn: () => api.getRoles(currentUser?.app_id).then(res => res.data),
  })

  const { data: forms } = useQuery({
    queryKey: ['forms', currentUser?.app_id],
    queryFn: () => api.getForms(currentUser?.app_id).then(res => res.data),
  })

  const { data: reports } = useQuery({
    queryKey: ['reports', currentUser?.app_id],
    queryFn: () => api.getReports(currentUser?.app_id).then(res => res.data),
  })

  const { data: formPermissions } = useQuery({
    queryKey: ['form-permissions', selectedRole],
    queryFn: () => selectedRole ? api.getFormPermissions(selectedRole).then(res => res.data) : [],
    enabled: !!selectedRole,
  })

  const { data: reportPermissions } = useQuery({
    queryKey: ['report-permissions', selectedRole],
    queryFn: () => selectedRole ? api.getReportPermissions(selectedRole).then(res => res.data) : [],
    enabled: !!selectedRole,
  })

  const getPermissionStatus = (permissions: any[], itemId: string, permission: string) => {
    const perm = permissions?.find(p => p.form_id === itemId || p.report_id === itemId)
    return perm?.[permission] || false
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Permissions</h1>
          <p className="text-secondary-600">Manage role-based access control</p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Select Role
          </h2>
        </div>
        <div className="card-content">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">Select a role to manage permissions</option>
            {roles?.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRole && (
        <>
          {/* Form Permissions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Form Permissions
              </h2>
            </div>
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Form</th>
                      <th>Create</th>
                      <th>Read</th>
                      <th>Update</th>
                      <th>Delete</th>
                      <th>Filter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms?.map((form: any) => (
                      <tr key={form.id}>
                        <td>
                          <div>
                            <p className="font-medium text-secondary-900">{form.name}</p>
                            <p className="text-sm text-secondary-500">{form.code}</p>
                          </div>
                        </td>
                        <td>
                          {getPermissionStatus(formPermissions, form.id, 'can_create') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(formPermissions, form.id, 'can_read') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(formPermissions, form.id, 'can_update') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(formPermissions, form.id, 'can_delete') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(formPermissions, form.id, 'can_filter') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Report Permissions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Report Permissions
              </h2>
            </div>
            <div className="card-content p-0">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>View</th>
                      <th>Filter</th>
                      <th>Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports?.map((report: any) => (
                      <tr key={report.id}>
                        <td>
                          <div>
                            <p className="font-medium text-secondary-900">{report.name}</p>
                            <p className="text-sm text-secondary-500">{report.form?.name}</p>
                          </div>
                        </td>
                        <td>
                          {getPermissionStatus(reportPermissions, report.id, 'can_view') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(reportPermissions, report.id, 'can_filter') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                        <td>
                          {getPermissionStatus(reportPermissions, report.id, 'can_export') ? (
                            <Check className="w-5 h-5 text-success-600" />
                          ) : (
                            <X className="w-5 h-5 text-error-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PermissionsPage