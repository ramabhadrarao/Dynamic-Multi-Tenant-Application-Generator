import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const Header: React.FC = () => {
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/dashboard':
        return 'Dashboard'
      case '/applications':
        return 'Applications'
      case '/users':
        return 'Users'
      case '/roles':
        return 'Roles'
      case '/forms':
        return 'Forms'
      case '/reports':
        return 'Reports'
      case '/permissions':
        return 'Permissions'
      default:
        if (path.includes('/forms/builder')) return 'Form Builder'
        if (path.includes('/reports/builder')) return 'Report Builder'
        return 'Dashboard'
    }
  }

  return (
    <header className="bg-white border-b border-secondary-200 h-16">
      <div className="flex items-center justify-between h-full px-6">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search..."
              className="input pl-10 w-80"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header