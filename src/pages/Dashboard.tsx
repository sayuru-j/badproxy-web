import { useState, useEffect } from 'react'
import { Server, Users, FileText, Activity, CheckCircle, XCircle } from 'lucide-react'
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

  const fetchDashboardData = async () => {
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
  }

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchDashboardData()
    }
  }, [isConnected, isAuthenticated])

  if (authLoading) {
    return <Loading message="Connecting to API..." />
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <ErrorMessage 
          message="Authentication required to view dashboard"
          variant="error"
        />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <ErrorMessage 
          message={authError || 'Unable to connect to BadProxy API'}
          onRetry={fetchDashboardData}
          variant="error"
        />
      </div>
    )
  }

  const stats = [
    {
      title: 'API Status',
      value: health?.status || 'Unknown',
      icon: Server,
      color: isConnected ? 'text-green-500' : 'text-red-500'
    },
    {
      title: 'VMess Users',
      value: vmessUsers?.total_vmess_users || 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Services',
      value: services.filter(s => s.status === 'running').length,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Config Files',
      value: configFiles.length,
      icon: FileText,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-gray-400">
          {health && (
            <span>Last updated: {new Date(health.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={fetchDashboardData}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <div className="flex items-center space-x-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <Card title="System Information">
          {loading ? (
            <Loading message="Loading system info..." size="sm" />
          ) : systemInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-white">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VMess Enabled:</span>
                <span className={systemInfo.vmess_enabled ? 'text-green-500' : 'text-red-500'}>
                  {systemInfo.vmess_enabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Config Path:</span>
                <span className="text-white text-sm font-mono break-all">
                  {systemInfo.config_path}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Protocols:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {systemInfo.installed_protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-2 py-1 bg-gray-800 text-white text-xs rounded"
                    >
                      {protocol}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No system information available</p>
          )}
        </Card>

        {/* Services Status */}
        <Card title="Services Status">
          {loading ? (
            <Loading message="Loading services..." size="sm" />
          ) : services.length > 0 ? (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                  <div className="flex items-center space-x-3">
                    {service.status === 'running' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-white font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${
                      service.status === 'running' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {service.status}
                    </div>
                    {service.pid && (
                      <div className="text-xs text-gray-400">PID: {service.pid}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No services information available</p>
          )}
        </Card>
      </div>

      {/* VMess Users Summary */}
      {vmessUsers && (
        <Card title="VMess Users Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{vmessUsers.total_vmess_users}</p>
              <p className="text-gray-400">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {vmessUsers.users.filter(u => u.vmess_available).length}
              </p>
              <p className="text-gray-400">Active VMess</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {vmessUsers.users.filter(u => u.has_subscription).length}
              </p>
              <p className="text-gray-400">With Subscriptions</p>
            </div>
          </div>
          
          {vmessUsers.users.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Users</h4>
              <div className="space-y-2">
                {vmessUsers.users.slice(0, 3).map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-white text-sm">{cleanEmailAddress(user.email)}</span>
                    <div className="flex space-x-2">
                      {user.vmess_available && (
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                          VMess
                        </span>
                      )}
                      {user.has_subscription && (
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                          Sub
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