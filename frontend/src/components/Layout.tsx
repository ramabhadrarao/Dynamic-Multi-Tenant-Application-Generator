import React, { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout