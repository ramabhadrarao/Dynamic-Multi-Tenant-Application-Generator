import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = '/api'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  // Auth endpoints
  login(credentials: { username: string; password: string }) {
    return this.api.post('/auth/login', credentials)
  }

  register(userData: any) {
    return this.api.post('/auth/register', userData)
  }

  getProfile() {
    return this.api.get('/auth/profile')
  }

  refreshToken() {
    return this.api.post('/auth/refresh')
  }

  // Applications endpoints
  getApplications() {
    return this.api.get('/applications')
  }

  getApplication(id: string) {
    return this.api.get(`/applications/${id}`)
  }

  createApplication(data: any) {
    return this.api.post('/applications', data)
  }

  updateApplication(id: string, data: any) {
    return this.api.patch(`/applications/${id}`, data)
  }

  deleteApplication(id: string) {
    return this.api.delete(`/applications/${id}`)
  }

  // Users endpoints
  getUsers(appId?: string) {
    const params = appId ? { app_id: appId } : {}
    return this.api.get('/users', { params })
  }

  getUser(id: string) {
    return this.api.get(`/users/${id}`)
  }

  createUser(data: any) {
    return this.api.post('/users', data)
  }

  updateUser(id: string, data: any) {
    return this.api.patch(`/users/${id}`, data)
  }

  deleteUser(id: string) {
    return this.api.delete(`/users/${id}`)
  }

  // Roles endpoints
  getRoles(appId?: string) {
    const params = appId ? { app_id: appId } : {}
    return this.api.get('/roles', { params })
  }

  getRole(id: string) {
    return this.api.get(`/roles/${id}`)
  }

  createRole(data: any) {
    return this.api.post('/roles', data)
  }

  updateRole(id: string, data: any) {
    return this.api.patch(`/roles/${id}`, data)
  }

  deleteRole(id: string) {
    return this.api.delete(`/roles/${id}`)
  }

  // Forms endpoints
  getForms(appId?: string) {
    const params = appId ? { app_id: appId } : {}
    return this.api.get('/forms', { params })
  }

  getForm(id: string) {
    return this.api.get(`/forms/${id}`)
  }

  createForm(data: any) {
    return this.api.post('/forms', data)
  }

  updateForm(id: string, data: any) {
    return this.api.patch(`/forms/${id}`, data)
  }

  deleteForm(id: string) {
    return this.api.delete(`/forms/${id}`)
  }

  getFormFields(formId: string) {
    return this.api.get(`/forms/${formId}/fields`)
  }

  createFormField(formId: string, data: any) {
    return this.api.post(`/forms/${formId}/fields`, data)
  }

  updateFormField(fieldId: string, data: any) {
    return this.api.patch(`/forms/fields/${fieldId}`, data)
  }

  deleteFormField(fieldId: string) {
    return this.api.delete(`/forms/fields/${fieldId}`)
  }

  updateFormCustomCode(formId: string, data: any) {
    return this.api.patch(`/forms/${formId}/custom-code`, data)
  }

  // Reports endpoints
  getReports(appId?: string) {
    const params = appId ? { app_id: appId } : {}
    return this.api.get('/reports', { params })
  }

  getReport(id: string) {
    return this.api.get(`/reports/${id}`)
  }

  createReport(data: any) {
    return this.api.post('/reports', data)
  }

  updateReport(id: string, data: any) {
    return this.api.patch(`/reports/${id}`, data)
  }

  deleteReport(id: string) {
    return this.api.delete(`/reports/${id}`)
  }

  createReportColumn(reportId: string, data: any) {
    return this.api.post(`/reports/${reportId}/columns`, data)
  }

  updateReportColumn(columnId: string, data: any) {
    return this.api.patch(`/reports/columns/${columnId}`, data)
  }

  deleteReportColumn(columnId: string) {
    return this.api.delete(`/reports/columns/${columnId}`)
  }

  createReportFilter(reportId: string, data: any) {
    return this.api.post(`/reports/${reportId}/filters`, data)
  }

  updateReportFilter(filterId: string, data: any) {
    return this.api.patch(`/reports/filters/${filterId}`, data)
  }

  deleteReportFilter(filterId: string) {
    return this.api.delete(`/reports/filters/${filterId}`)
  }

  updateReportCustomCode(reportId: string, data: any) {
    return this.api.patch(`/reports/${reportId}/custom-code`, data)
  }

  // Permissions endpoints
  createFormPermission(data: any) {
    return this.api.post('/permissions/forms', data)
  }

  createFieldPermission(data: any) {
    return this.api.post('/permissions/fields', data)
  }

  createReportPermission(data: any) {
    return this.api.post('/permissions/reports', data)
  }

  getFormPermissions(roleId: string) {
    return this.api.get(`/permissions/forms/role/${roleId}`)
  }

  getFieldPermissions(roleId: string, formId?: string) {
    if (formId) {
      return this.api.get(`/permissions/fields/role/${roleId}/form/${formId}`)
    }
    return this.api.get(`/permissions/fields/role/${roleId}`)
  }

  getReportPermissions(roleId: string) {
    return this.api.get(`/permissions/reports/role/${roleId}`)
  }

  deleteFormPermission(roleId: string, formId: string) {
    return this.api.delete(`/permissions/forms/role/${roleId}/form/${formId}`)
  }

  deleteFieldPermission(roleId: string, formId: string, fieldId: string) {
    return this.api.delete(`/permissions/fields/role/${roleId}/form/${formId}/field/${fieldId}`)
  }

  deleteReportPermission(roleId: string, reportId: string) {
    return this.api.delete(`/permissions/reports/role/${roleId}/report/${reportId}`)
  }
}

export const authApi = new ApiService()
export const api = new ApiService()