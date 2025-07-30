import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'

interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  app_id: string
  role?: {
    id: string
    name: string
  }
  application?: {
    id: string
    name: string
    code: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.setAuthToken(token)
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authApi.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('token')
      authApi.setAuthToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password })
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      authApi.setAuthToken(access_token)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    authApi.setAuthToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken()
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      authApi.setAuthToken(access_token)
    } catch (error) {
      console.error('Failed to refresh token:', error)
      logout()
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}