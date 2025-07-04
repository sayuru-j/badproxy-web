import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import type { SystemInfo, HealthResponse } from '../types/api'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  last_login: string | null
}

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean
  user: User | null
  token: string | null
  
  // API connection state
  isConnected: boolean
  systemInfo: SystemInfo | null
  health: HealthResponse | null
  isLoading: boolean
  error: string | null
  
  // Authentication methods
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  
  // API methods
  refreshHealth: () => Promise<void>
  refreshSystemInfo: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  
  // Token management
  getTokenExpiry: () => Date | null
  isTokenExpired: () => boolean
  refreshToken: () => Promise<boolean>
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
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null)
  
  // API connection state
  const [isConnected, setIsConnected] = useState(false)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('badproxy_token')
    const storedUser = localStorage.getItem('badproxy_user')
    const storedExpiry = localStorage.getItem('badproxy_token_expiry')
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        const expiry = storedExpiry ? new Date(storedExpiry) : null
        
        // Check if token is expired
        if (expiry && expiry > new Date()) {
          setToken(storedToken)
          setUser(parsedUser)
          setTokenExpiry(expiry)
          setIsAuthenticated(true)
          apiService.setAuthToken(storedToken)
        } else {
          // Token expired, clear storage
          logout()
        }
      } catch (err) {
        console.error('Failed to restore auth state:', err)
        logout()
      }
    }
    setIsLoading(false)
  }, [])

  // Listen for auth expiry events from API service
  useEffect(() => {
    const handleAuthExpired = () => {
      logout()
      setError('Your session has expired. Please log in again.')
    }

    window.addEventListener('auth-expired', handleAuthExpired)
    return () => window.removeEventListener('auth-expired', handleAuthExpired)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.login(username, password)
      
      if (response.access_token) {
        setToken(response.access_token)
        setIsAuthenticated(true)
        
        // Calculate expiry time (from expires_in seconds)
        const expiry = new Date(Date.now() + (response.expires_in * 1000))
        setTokenExpiry(expiry)
        
        // Store in localStorage
        localStorage.setItem('badproxy_token', response.access_token)
        localStorage.setItem('badproxy_token_expiry', expiry.toISOString())
        
        // Set token in API service
        apiService.setAuthToken(response.access_token)
        
        // Get user info
        await refreshUserInfo()
        
        return true
      }
      
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    setTokenExpiry(null)
    localStorage.removeItem('badproxy_token')
    localStorage.removeItem('badproxy_user')
    localStorage.removeItem('badproxy_token_expiry')
    apiService.clearAuthToken()
    setIsConnected(false)
    setSystemInfo(null)
    setHealth(null)
    setError(null)
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setError(null)
      await apiService.changePassword(currentPassword, newPassword)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
      return false
    }
  }

  const refreshUserInfo = async () => {
    if (!isAuthenticated) return
    
    try {
      const userInfo = await apiService.getCurrentUser()
      setUser(userInfo)
      localStorage.setItem('badproxy_user', JSON.stringify(userInfo))
    } catch (err) {
      console.error('Failed to get user info:', err)
      // If we can't get user info, token might be invalid
      if (err instanceof Error && err.message.includes('401')) {
        logout()
      }
    }
  }

  const refreshHealth = async () => {
    try {
      const healthData = await apiService.health()
      setHealth(healthData)
      setIsConnected(true)
      setError(null)
    } catch (err) {
      setIsConnected(false)
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to API'
      if (!error) { // Only set error if no other error exists
        setError(errorMessage)
      }
    }
  }

  const refreshSystemInfo = async () => {
    if (!isAuthenticated || !isConnected) return
    
    try {
      const systemData = await apiService.getSystemStatus()
      setSystemInfo(systemData)
    } catch (err) {
      console.error('Failed to get system info:', err)
      // Don't override authentication errors
      if (!error?.includes('expired') && !error?.includes('401')) {
        setError(err instanceof Error ? err.message : 'Failed to get system info')
      }
    }
  }

  const getTokenExpiry = (): Date | null => {
    return tokenExpiry
  }

  const isTokenExpired = (): boolean => {
    if (!tokenExpiry) return true
    return new Date() >= tokenExpiry
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!user) return false
    
    try {
      // In a real app, you'd call a refresh endpoint
      // For now, we'll just extend the current token's expiry
      const newExpiry = new Date(Date.now() + (30 * 60 * 1000)) // 30 minutes
      setTokenExpiry(newExpiry)
      localStorage.setItem('badproxy_token_expiry', newExpiry.toISOString())
      return true
    } catch (err) {
      console.error('Failed to refresh token:', err)
      return false
    }
  }

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiry) return

    const checkTokenExpiry = () => {
      const timeUntilExpiry = tokenExpiry.getTime() - Date.now()
      
      // If token expires in less than 5 minutes, try to refresh
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        refreshToken()
      }
      
      // If token is expired, logout
      if (timeUntilExpiry <= 0) {
        logout()
        setError('Your session has expired. Please log in again.')
      }
    }

    const interval = setInterval(checkTokenExpiry, 60 * 1000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated, tokenExpiry])

  // Initialize API connection and check auth status
  useEffect(() => {
    const initializeApi = async () => {
      // Always check health first (public endpoint)
      await refreshHealth()
      
      // If authenticated, get user info and system info
      if (isAuthenticated) {
        await Promise.all([
          refreshUserInfo(),
          refreshSystemInfo()
        ])
      }
    }

    if (!isLoading) {
      initializeApi()
    }
  }, [isAuthenticated, isLoading])

  // Set up periodic health checks
  useEffect(() => {
    if (!isAuthenticated) return
    
    const interval = setInterval(refreshHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const value: AuthContextType = {
    // Authentication state
    isAuthenticated,
    user,
    token,
    
    // API connection state
    isConnected,
    systemInfo,
    health,
    isLoading,
    error,
    
    // Authentication methods
    login,
    logout,
    changePassword,
    
    // API methods
    refreshHealth,
    refreshSystemInfo,
    refreshUserInfo,
    
    // Token management
    getTokenExpiry,
    isTokenExpired,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Export the context for direct use if needed
export { AuthContext }