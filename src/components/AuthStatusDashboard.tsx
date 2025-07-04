import { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Key,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  User,
  Server,
  Activity,
  Lock,
  Unlock,
  Terminal
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AuthInfoResponse {
  auth_methods: string[]
  token_endpoint: string
  api_key_header: string
  default_credentials: {
    username: string
    note: string
  }
}

interface SessionInfo {
  created_at: string
  last_activity: string
  ip_address: string
  user_agent: string
  requests_count: number
}

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

const StatusCard = ({ 
  title, 
  status, 
  icon: Icon, 
  color, 
  details 
}: {
  title: string
  status: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  details?: string
}) => (
  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className={`text-sm ${color}`}>{status}</p>
          {details && <p className="text-xs text-gray-400 mt-1">{details}</p>}
        </div>
      </div>
      <div className="flex items-center">
        {status.toLowerCase().includes('connected') || status.toLowerCase().includes('authenticated') ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : status.toLowerCase().includes('warning') ? (
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500" />
        )}
      </div>
    </div>
  </div>
)

const TokenInfoCard = () => {
  const { token, getTokenExpiry, refreshToken } = useAuth()
  const [showToken, setShowToken] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const updateTimeLeft = () => {
      const expiry = getTokenExpiry()
      if (!expiry) {
        setTimeLeft('Unknown')
        return
      }

      const now = new Date()
      const diff = expiry.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [getTokenExpiry])

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      // You could add a toast notification here
    }
  }

  const handleRefreshToken = async () => {
    setIsRefreshing(true)
    await refreshToken()
    setIsRefreshing(false)
  }

  const getExpiryStatus = () => {
    const expiry = getTokenExpiry()
    if (!expiry) return 'unknown'
    
    const diff = expiry.getTime() - new Date().getTime()
    if (diff <= 0) return 'expired'
    if (diff <= 5 * 60 * 1000) return 'warning' // 5 minutes
    if (diff <= 30 * 60 * 1000) return 'caution' // 30 minutes
    return 'valid'
  }

  const getExpiryColor = () => {
    switch (getExpiryStatus()) {
      case 'expired': return 'text-red-500'
      case 'warning': return 'text-red-400'
      case 'caution': return 'text-yellow-500'
      case 'valid': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (getExpiryStatus()) {
      case 'expired': return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'caution': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'valid': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-white font-medium mb-4 flex items-center">
        <Key className="w-5 h-5 mr-2" />
        JWT Token Information
      </h4>
      
      {/* Token Expiry Status */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-900 rounded">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="text-white text-sm font-medium">Token Status</p>
            <p className={`text-xs ${getExpiryColor()}`}>
              {getExpiryStatus() === 'expired' ? 'Token Expired' :
               getExpiryStatus() === 'warning' ? 'Expires Soon!' :
               getExpiryStatus() === 'caution' ? 'Expires in 30min' :
               'Active'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">Expires In</p>
          <p className={`text-sm font-mono ${getExpiryColor()}`}>
            {timeLeft}
          </p>
        </div>
      </div>

      {/* Token Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Bearer Token:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowToken(!showToken)}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded"
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyToken}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded"
              title="Copy token"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="bg-black p-3 rounded border border-gray-700">
          <p className="text-green-400 text-xs font-mono break-all">
            {showToken 
              ? token 
              : token 
                ? `${token.substring(0, 20)}${'•'.repeat(Math.max(0, token.length - 40))}${token.substring(token.length - 20)}`
                : 'No token available'
            }
          </p>
        </div>

        {/* Token Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Token'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const UserInfoCard = () => {
  const { user } = useAuth()

  if (!user) return null

  const mockSessionInfo: SessionInfo = {
    created_at: user.created_at,
    last_activity: new Date().toISOString(),
    ip_address: '192.168.1.100',
    user_agent: 'BadProxy Admin Dashboard',
    requests_count: 142
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-white font-medium mb-4 flex items-center">
        <User className="w-5 h-5 mr-2" />
        User Information
      </h4>
      
      {/* User Profile */}
      <div className="mb-4 p-3 bg-gray-900 rounded">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{user.full_name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded ${
                user.is_admin 
                  ? 'bg-yellow-900 text-yellow-300' 
                  : 'bg-blue-900 text-blue-300'
              }`}>
                {user.is_admin ? 'Administrator' : 'User'}
              </span>
              {user.is_admin && <Shield className="w-3 h-3 text-yellow-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs">User ID</p>
          <p className="text-white text-sm font-mono">#{user.id}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Status</p>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className={`text-sm ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Created</p>
          <p className="text-white text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Last Login</p>
          <p className="text-white text-sm">
            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      {/* Session Information */}
      <div className="border-t border-gray-700 pt-4">
        <h5 className="text-gray-300 text-sm font-medium mb-3">Current Session</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Session Started:</span>
            <span className="text-white">{new Date(mockSessionInfo.created_at).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Activity:</span>
            <span className="text-white">{new Date(mockSessionInfo.last_activity).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">IP Address:</span>
            <span className="text-white font-mono">{mockSessionInfo.ip_address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">API Requests:</span>
            <span className="text-white">{mockSessionInfo.requests_count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const APIMethodsCard = () => {
  const [authInfo, setAuthInfo] = useState<AuthInfoResponse | null>(null)
  const [apiKeyGenerated, setApiKeyGenerated] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Mock auth info - replace with actual API call
    setAuthInfo({
      auth_methods: ["Bearer Token", "API Key"],
      token_endpoint: "/auth/login",
      api_key_header: "X-API-Key",
      default_credentials: {
        username: "admin",
        note: "Change default credentials in production"
      }
    })
  }, [])

  const generateApiKey = async () => {
    setIsGenerating(true)
    // Mock API key generation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockApiKey = `bp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    setApiKeyGenerated(mockApiKey)
    setIsGenerating(false)
  }

  const copyApiKey = () => {
    if (apiKeyGenerated) {
      navigator.clipboard.writeText(apiKeyGenerated)
    }
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h4 className="text-white font-medium mb-4 flex items-center">
        <Terminal className="w-5 h-5 mr-2" />
        Authentication Methods
      </h4>
      
      {authInfo && (
        <div className="space-y-4">
          {/* Available Methods */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Available Methods:</p>
            <div className="space-y-2">
              {authInfo.auth_methods.map((method, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-900 rounded">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span className="text-white text-sm">{method}</span>
                  {method === "Bearer Token" && (
                    <span className="px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Information */}
          <div className="p-3 bg-blue-900/20 border border-blue-600 rounded">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-400">Token Endpoint:</span>
                <code className="text-blue-300">{authInfo.token_endpoint}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">API Key Header:</span>
                <code className="text-blue-300">{authInfo.api_key_header}</code>
              </div>
            </div>
          </div>

          {/* API Key Generation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">API Key Management:</p>
              <button
                onClick={generateApiKey}
                disabled={isGenerating}
                className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate New Key'}
              </button>
            </div>
            
            {apiKeyGenerated && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Generated API Key:</span>
                  <button
                    onClick={copyApiKey}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Copy API key"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-black p-2 rounded border border-gray-700">
                  <code className="text-green-400 text-xs break-all">{apiKeyGenerated}</code>
                </div>
                <p className="text-yellow-400 text-xs">⚠️ Store this key securely. It won't be shown again.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const AuthStatusDashboard = () => {
  const { 
    isConnected, 
    isAuthenticated, 
    health, 
    user, 
    refreshHealth, 
    refreshUserInfo,
    error
  } = useAuth()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([
      refreshHealth(),
      refreshUserInfo()
    ])
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-3" />
            Authentication Status
          </h1>
          <p className="text-gray-400 mt-1">Monitor your authentication status and session information</p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="API Connection"
          status={isConnected ? "Connected" : "Disconnected"}
          icon={isConnected ? Wifi : WifiOff}
          color={isConnected ? "text-green-500" : "text-red-500"}
          details={health ? `v${health.version}` : undefined}
        />
        
        <StatusCard
          title="Authentication"
          status={isAuthenticated ? "Authenticated" : "Not Authenticated"}
          icon={isAuthenticated ? Unlock : Lock}
          color={isAuthenticated ? "text-green-500" : "text-red-500"}
          details={user ? `as ${user.username}` : undefined}
        />
        
        <StatusCard
          title="User Role"
          status={user?.is_admin ? "Administrator" : user ? "User" : "Unknown"}
          icon={Shield}
          color={user?.is_admin ? "text-yellow-500" : "text-blue-500"}
          details={user ? `ID: #${user.id}` : undefined}
        />
        
        <StatusCard
          title="Session Status"
          status={isAuthenticated ? "Active" : "Inactive"}
          icon={Activity}
          color={isAuthenticated ? "text-green-500" : "text-gray-500"}
          details={isAuthenticated ? "Session active" : "No active session"}
        />
      </div>

      {/* Detailed Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {isAuthenticated && <TokenInfoCard />}
          <APIMethodsCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {isAuthenticated && <UserInfoCard />}
          
          {/* System Health */}
          {health && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2" />
                System Health
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">API Version:</span>
                  <span className="text-white">{health.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-500">{health.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">{new Date(health.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}