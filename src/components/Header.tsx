import { useState, useEffect, useRef } from 'react'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  LogOut,
  Shield,
  Key,
  UserCog,
  Bell,
  ChevronDown,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface UserMenuProps {
  user: any
  onLogout: () => void
  onChangePassword: () => void
  onSettings: () => void
  onUserManagement: () => void
  isMobile?: boolean
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  user, 
  onLogout, 
  onChangePassword, 
  onSettings, 
  onUserManagement,
  isMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs sm:text-sm font-bold">
            {getInitials(user.full_name || user.username)}
          </span>
        </div>
        {!isMobile && (
          <div className="hidden md:block text-left">
            <p className="text-xs sm:text-sm text-white font-medium">{user.username}</p>
            <p className="text-xs text-gray-400">
              {user.is_admin ? 'Administrator' : 'User'}
            </p>
          </div>
        )}
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
          )}
          
          {/* Menu */}
          <div className={`absolute ${isMobile ? 'right-0 top-full' : 'right-0'} mt-2 w-64 sm:w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl ${isMobile ? 'z-50' : 'z-40'}`}>
            {/* User Info Header */}
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {getInitials(user.full_name || user.username)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      user.is_admin 
                        ? 'bg-yellow-900 text-yellow-300' 
                        : 'bg-blue-900 text-blue-300'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                    {user.is_admin && (
                      <Shield className="w-3 h-3 text-yellow-500">Administrator</Shield>
                    )}
                  </div>
                </div>
              </div>
              
              {user.last_login && (
                <div className="mt-2 text-xs text-gray-500">
                  Last login: {new Date(user.last_login).toLocaleString()}
                </div>
              )}
            </div>
            
            {/* Menu Items */}
            <div className="p-2">
              <button 
                onClick={() => {
                  onSettings()
                  setIsOpen(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </button>
              
              <button 
                onClick={() => {
                  onChangePassword()
                  setIsOpen(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                <Key className="w-4 h-4 mr-3" />
                Change Password
              </button>
              
              {user.is_admin && (
                <button 
                  onClick={() => {
                    onUserManagement()
                    setIsOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
                >
                  <UserCog className="w-4 h-4 mr-3" />
                  User Management
                </button>
              )}
              
              <div className="border-t border-gray-700 my-2" />
              
              <button 
                onClick={() => {
                  onLogout()
                  setIsOpen(false)
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface ConnectionStatusProps {
  isConnected: boolean
  health: any
  isMobile?: boolean
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, health, isMobile = false }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            {!isMobile && <span className="text-xs sm:text-sm text-green-500">Connected</span>}
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
            {!isMobile && <span className="text-xs sm:text-sm text-red-500">Disconnected</span>}
          </>
        )}
        {health && !isMobile && (
          <span className="text-xs text-gray-400">
            v{health.version}
          </span>
        )}
      </button>

      {showDetails && (
        <>
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDetails(false)} />
          )}
          <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-3 sm:p-4">
              <h4 className="text-white font-medium mb-3 text-sm sm:text-base">API Status</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {health && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Version:</span>
                      <span className="text-white">{health.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Updated:</span>
                      <span className="text-white">
                        {new Date(health.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface NotificationBellProps {
  count?: number
  notifications?: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    timestamp: string
  }>
  isMobile?: boolean
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  count = 0, 
  notifications = [],
  isMobile = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false)

  const defaultNotifications = [
    {
      id: '1',
      title: 'System Update',
      message: 'VMess configuration updated successfully',
      type: 'success' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Connection Warning',
      message: 'High latency detected on server connection',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]

  const allNotifications = notifications.length > 0 ? notifications : defaultNotifications
  const totalCount = count > 0 ? count : allNotifications.length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
      case 'error': return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
      default: return <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
      >
        <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowNotifications(false)} />
          )}
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium text-sm sm:text-base">Notifications</h4>
                <span className="text-xs text-gray-400">{totalCount} new</span>
              </div>
            </div>
            
            <div className="max-h-56 sm:max-h-64 overflow-y-auto">
              {allNotifications.map((notification) => (
                <div key={notification.id} className="p-3 border-b border-gray-700 hover:bg-gray-700/50">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-white font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-700">
              <button className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onLogout: () => void
  onChangePassword: () => void
  onSettings: () => void
  onUserManagement: () => void
  isConnected: boolean
  health: any
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onChangePassword,
  onSettings,
  onUserManagement,
  isConnected,
  health
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Mobile Menu */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Connection Status */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white font-medium mb-3">API Status</h4>
              <div className="flex items-center space-x-2 mb-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {health && (
                <p className="text-xs text-gray-400">Version: {health.version}</p>
              )}
            </div>

            {/* User Menu */}
            <UserMenu
              user={user}
              onLogout={onLogout}
              onChangePassword={onChangePassword}
              onSettings={onSettings}
              onUserManagement={onUserManagement}
              isMobile={true}
            />

            {/* Notifications */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-white font-medium mb-3">Notifications</h4>
              <NotificationBell isMobile={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const EnhancedHeader = () => {
  const { 
    isConnected, 
    health, 
    user, 
    isLoading, 
    refreshHealth,
    logout,
  } = useAuth()

  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleChangePassword = () => {
    console.log('Open change password modal')
  }

  const handleSettings = () => {
    console.log('Navigate to settings')
  }

  const handleUserManagement = () => {
    console.log('Navigate to user management')
  }

  // Quick stats (mock data - replace with real data from your context)
  const quickStats = {
    activeServices: 3,
    activeUsers: 24,
    configFiles: 8
  }

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              BadProxy Admin
            </h2>
            
            {/* Quick Stats - Hidden on mobile */}
            <div className="hidden xl:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Activity className="w-4 h-4 text-green-500" />
                <span>{quickStats.activeServices} Services</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="w-4 h-4 text-blue-500" />
                <span>{quickStats.activeUsers} Users</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>{quickStats.configFiles} Configs</span>
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Connection Status */}
              <ConnectionStatus isConnected={isConnected} health={health} />
              
              {/* Refresh Button */}
              <button
                onClick={refreshHealth}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-800"
                title="Refresh connection"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Notifications */}
              <NotificationBell />
              
              {/* Last Updated */}
              {health && (
                <div className="hidden lg:block text-sm text-gray-400">
                  <span>Updated: {new Date(health.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
              
              {/* User Menu */}
              {user && (
                <UserMenu 
                  user={user}
                  onLogout={logout}
                  onChangePassword={handleChangePassword}
                  onSettings={handleSettings}
                  onUserManagement={handleUserManagement}
                />
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex sm:hidden items-center space-x-2">
              <ConnectionStatus isConnected={isConnected} health={health} isMobile={true} />
              <NotificationBell isMobile={true} />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Admin Panel Indicator */}
        {user?.is_admin && (
          <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-xs">
            <Shield className="w-3 h-3 text-yellow-500" />
            <span className="text-yellow-500">Administrator Panel Active</span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span className="hidden sm:inline text-gray-400">Full system access enabled</span>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {user && (
        <MobileMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          user={user}
          onLogout={logout}
          onChangePassword={handleChangePassword}
          onSettings={handleSettings}
          onUserManagement={handleUserManagement}
          isConnected={isConnected}
          health={health}
        />
      )}
    </>
  )
}