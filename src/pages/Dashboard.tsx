import { useState, useEffect, useCallback } from 'react'
import { Server, Users, FileText, Activity, CheckCircle, XCircle, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { Card } from '../components/Card'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { cleanEmailAddress } from '../utils'
import type { ServiceStatus, VMessUsersResponse } from '../types/api'

export const Dashboard = () => {
  const { 
    isConnected, 
    systemInfo, 
    health, 
    isLoading: authLoading, 
    error: authError,
    isAuthenticated 
  } = useAuth()
  
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [vmessUsers, setVmessUsers] = useState<VMessUsersResponse | null>(null)
  const [configFiles, setConfigFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!isConnected || !isAuthenticated) return
    
    setLoading(true)
    setError(null)

    try {
      const [servicesData, vmessData, configData] = await Promise.allSettled([
        apiService.getSystemServices(),
        apiService.getVMessUsers(),
        apiService.getConfigFiles()
      ])

      if (servicesData.status === 'fulfilled') {
        setServices(servicesData.value)
      } else {
        console.error('Failed to load services:', servicesData.reason)
      }

      if (vmessData.status === 'fulfilled') {
        setVmessUsers(vmessData.value)
      } else {
        console.error('Failed to load VMess users:', vmessData.reason)
      }

      if (configData.status === 'fulfilled') {
        setConfigFiles(configData.value.vmess_files)
      } else {
        console.error('Failed to load config files:', configData.reason)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [isConnected, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchDashboardData()
    }
  }, [isConnected, isAuthenticated, fetchDashboardData])

  if (authLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Loading message="Connecting to BadProxy API..." size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <ErrorMessage 
          message="Authentication required to view dashboard"
          variant="error"
          size="md"
        />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <ErrorMessage 
          title="Connection Failed"
          message={authError || 'Unable to connect to BadProxy API. Please check your connection and try again.'}
          onRetry={fetchDashboardData}
          variant="error"
          size="md"
        />
      </div>
    )
  }

  const stats = [
    {
      title: 'API Status',
      value: health?.status || 'Unknown',
      icon: Server,
      color: isConnected ? 'text-green-500' : 'text-red-500',
      bgColor: isConnected ? 'bg-green-500/10' : 'bg-red-500/10',
      trend: isConnected ? '+100%' : null
    },
    {
      title: 'VMess Users',
      value: vmessUsers?.total_vmess_users || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: vmessUsers?.total_vmess_users ? `${vmessUsers.users.filter(u => u.vmess_available).length} active` : null
    },
    {
      title: 'Active Services',
      value: services.filter(s => s.status === 'running').length,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: services.length > 0 ? `${services.length} total` : null
    },
    {
      title: 'Config Files',
      value: configFiles.length,
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      trend: configFiles.length > 0 ? 'VMess ready' : null
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Welcome to BadProxy Administration
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end space-x-3">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className={`text-xs sm:text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
          
          {/* Last Updated */}
          {health && (
            <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
              Updated: {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          title="Dashboard Error"
          message={error}
          onRetry={fetchDashboardData}
          onDismiss={() => setError(null)}
          variant="error"
          size="md"
        />
      )}

      {/* Quick Actions - Mobile Only */}
      <div className="sm:hidden">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm whitespace-nowrap">
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm whitespace-nowrap">
            <FileText className="w-4 h-4" />
            <span>View Configs</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm whitespace-nowrap">
            <Activity className="w-4 h-4" />
            <span>System Status</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Enhanced Mobile Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-3 sm:p-4 lg:p-6 hover:border-gray-600 transition-colors">
            <div className="flex flex-col space-y-2 sm:space-y-3">
              {/* Icon and Value Row */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">{stat.trend}</span>
                  </div>
                )}
              </div>
              
              {/* Title and Value */}
              <div>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{stat.title}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* System Info */}
        <Card 
          title="System Information" 
          className="hover:border-gray-600 transition-colors"
        >
          {loading ? (
            <Loading message="Loading system info..." size="sm" />
          ) : systemInfo ? (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-400 text-sm">Version</span>
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base mt-1">{systemInfo.version}</p>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className={`w-4 h-4 ${systemInfo.vmess_enabled ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-gray-400 text-sm">VMess Status</span>
                  </div>
                  <p className={`font-medium text-sm sm:text-base mt-1 ${systemInfo.vmess_enabled ? 'text-green-500' : 'text-red-500'}`}>
                    {systemInfo.vmess_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Config Path */}
              <div>
                <span className="text-gray-400 text-sm flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Configuration Path</span>
                </span>
                <div className="p-2 sm:p-3 bg-black rounded-lg border border-gray-700">
                  <code className="text-green-400 text-xs sm:text-sm break-all">
                    {systemInfo.config_path}
                  </code>
                </div>
              </div>

              {/* Protocols */}
              <div>
                <span className="text-gray-400 text-sm flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4" />
                  <span>Installed Protocols</span>
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {systemInfo.installed_protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-lg font-medium uppercase"
                    >
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Server className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No system information available</p>
            </div>
          )}
        </Card>

        {/* Services Status */}
        <Card 
          title="Services Status" 
          className="hover:border-gray-600 transition-colors"
        >
          {loading ? (
            <Loading message="Loading services..." size="sm" />
          ) : services.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-full ${service.status === 'running' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {service.status === 'running' ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-white font-medium text-sm sm:text-base block">{service.service}</span>
                      <span className={`text-xs ${service.status === 'running' ? 'text-green-400' : 'text-red-400'}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {service.pid && (
                      <div className="text-xs text-gray-400">PID: {service.pid}</div>
                    )}
                    {service.uptime && (
                      <div className="text-xs text-gray-500">{service.uptime}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No services information available</p>
            </div>
          )}
        </Card>
      </div>

      {/* VMess Users Summary */}
      {vmessUsers && (
        <Card 
          title="VMess Users Overview" 
          className="hover:border-gray-600 transition-colors"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg border border-blue-800/30">
              <p className="text-2xl sm:text-3xl font-bold text-white">{vmessUsers.total_vmess_users}</p>
              <p className="text-blue-400 text-sm font-medium">Total Users</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg border border-green-800/30">
              <p className="text-2xl sm:text-3xl font-bold text-green-400">
                {vmessUsers.users.filter(u => u.vmess_available).length}
              </p>
              <p className="text-green-400 text-sm font-medium">Active VMess</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-lg border border-purple-800/30">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">
                {vmessUsers.users.filter(u => u.has_subscription).length}
              </p>
              <p className="text-purple-400 text-sm font-medium">With Subscriptions</p>
            </div>
          </div>
          
          {/* Recent Users */}
          {vmessUsers.users.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-400 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Recent Users</span>
                </h4>
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View All
                </button>
              </div>
              
              <div className="space-y-2">
                {vmessUsers.users.slice(0, 3).map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {cleanEmailAddress(user.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white text-sm truncate">
                        {cleanEmailAddress(user.email)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      {user.vmess_available && (
                        <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded-full border border-green-800">
                          <span className="hidden sm:inline">VMess</span>
                          <span className="sm:hidden">VM</span>
                        </span>
                      )}
                      {user.has_subscription && (
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-800">
                          <span className="hidden sm:inline">Sub</span>
                          <span className="sm:hidden">S</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}