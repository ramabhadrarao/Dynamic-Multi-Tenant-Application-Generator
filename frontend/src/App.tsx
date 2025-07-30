import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ApplicationsPage from './pages/ApplicationsPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import FormsPage from './pages/FormsPage'
import FormBuilderPage from './pages/FormBuilderPage'
import FormDataPage from './pages/FormDataPage'
import ReportsPage from './pages/ReportsPage'
import ReportBuilderPage from './pages/ReportBuilderPage'
import PermissionsPage from './pages/PermissionsPage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/builder/:id?" element={<FormBuilderPage />} />
        <Route path="/forms/:formId/data" element={<FormDataPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/builder/:id?" element={<ReportBuilderPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App