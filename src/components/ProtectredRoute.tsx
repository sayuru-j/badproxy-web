import React from 'react'
import { Shield, Lock, Loader2, AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false,
  fallback,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user, isConnected } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show not authenticated screen
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-900 p-6 rounded-full mx-auto mb-6 w-fit border border-gray-700">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            You need to sign in to access this page. Please authenticate with your BadProxy credentials.
          </p>
          
          {!isConnected && (
            <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">API connection unavailable</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = redirectTo}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>BadProxy Admin - Secure Access Required</p>
          </div>
        </div>
      </div>
    )
  }

  // Check admin access if required
  if (adminOnly && user && !user.is_admin) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-900 p-6 rounded-full mx-auto mb-6 w-fit border border-gray-700">
            <Shield className="w-12 h-12 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Administrator Access Required</h2>
          <p className="text-gray-400 mb-2">
            This page requires administrator privileges to access.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Current user: <span className="text-white font-medium">{user.username}</span> ({user.is_admin ? 'Admin' : 'User'})
          </p>
          
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-yellow-400 text-sm font-medium mb-1">Insufficient Permissions</p>
                <p className="text-yellow-300 text-xs">
                  Contact your administrator to request elevated privileges for this section.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}

// Hook for checking specific permissions
export const usePermissions = () => {
  const { user } = useAuth()
  
  return {
    isAdmin: user?.is_admin || false,
    canManageUsers: user?.is_admin || false,
    canViewSystem: user?.is_admin || false,
    canManageVMess: true, // All authenticated users can manage VMess
    canViewConfig: true, // All authenticated users can view config
    canRenewCertificate: user?.is_admin || false,
    canGenerateApiKeys: user?.is_admin || false,
    canViewLogs: user?.is_admin || false,
    canManageServices: user?.is_admin || false,
  }
}

// Component for conditional rendering based on permissions
interface RequirePermissionProps {
  permission: keyof ReturnType<typeof usePermissions>
  children: React.ReactNode
  fallback?: React.ReactNode
  showFallback?: boolean
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  children,
  fallback = null,
  showFallback = true
}) => {
  const permissions = usePermissions()
  const { user } = useAuth()
  
  if (permissions[permission]) {
    return <>{children}</>
  }
  
  if (!showFallback) {
    return null
  }
  
  if (fallback) {
    return <>{fallback}</>
  }
  
  // Default fallback for insufficient permissions
  return (
    <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-400 text-sm font-medium">Insufficient Permissions</p>
          <p className="text-yellow-300 text-xs mt-1">
            Your account ({user?.username}) doesn't have permission to access this feature.
          </p>
        </div>
      </div>
    </div>
  )
}

// Component for admin-only sections
interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showWarning?: boolean
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({
  children,
  fallback,
  showWarning = true
}) => {
  return (
    <RequirePermission 
      permission="isAdmin" 
      fallback={fallback}
      showFallback={showWarning}
    >
      {children}
    </RequirePermission>
  )
}

// Higher-order component for protecting entire pages
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    adminOnly?: boolean
    redirectTo?: string
  } = {}
) => {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute 
      adminOnly={options.adminOnly}
      redirectTo={options.redirectTo}
    >
      <Component {...props} />
    </ProtectedRoute>
  )
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Route-level protection helpers
export const RouteProtection = {
  // For regular authenticated routes
  User: (children: React.ReactNode) => (
    <ProtectedRoute>{children}</ProtectedRoute>
  ),
  
  // For admin-only routes
  Admin: (children: React.ReactNode) => (
    <ProtectedRoute adminOnly>{children}</ProtectedRoute>
  ),
  
  // For optional authentication with fallback
  Optional: (children: React.ReactNode, fallback?: React.ReactNode) => (
    <ProtectedRoute fallback={fallback}>{children}</ProtectedRoute>
  )
}