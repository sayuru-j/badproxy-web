import { useState, useEffect } from 'react'
import { 
  Shield, 
  Copy, 
  Download, 
  Search,
} from 'lucide-react'
import { Card } from '../components/Card'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { cleanEmailAddress, copyToClipboard } from '../utils'
import type { 
  VMessUser, 
  VMessConfigResponse,
  PopularSNIResponse 
} from '../types/api'

export const VMess = () => {
  const { isConnected, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<VMessUser[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userConfig, setUserConfig] = useState<VMessConfigResponse | null>(null)
  const [popularSNI, setPopularSNI] = useState<PopularSNIResponse | null>(null)
  const [configFiles, setConfigFiles] = useState<string[]>([])
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>('')
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [configFormat, setConfigFormat] = useState<'subscription' | 'decoded' | 'v2ray'>('v2ray')
  const [customSNI, setCustomSNI] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigFiles = async () => {
    if (!isConnected || !isAuthenticated) return
    
    try {
      const configData = await apiService.getConfigFiles()
      const vmessFiles = configData.vmess_files
      setConfigFiles(vmessFiles)
      
      // Auto-select the first VMess config file if available
      if (vmessFiles.length > 0 && !selectedConfigFile) {
        setSelectedConfigFile(vmessFiles[0])
      }
    } catch (err) {
      console.error('Failed to load config files:', err)
    }
  }

  const fetchVMessUsers = async (configFile?: string) => {
    if (!isConnected || !isAuthenticated) return
    
    setLoading(true)
    setError(null)

    try {
      const data = await apiService.getVMessUsers(configFile || selectedConfigFile || undefined)
      setUsers(data.users)
      setTotalUsers(data.total_vmess_users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load VMess users')
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularSNI = async () => {
    try {
      const data = await apiService.getPopularSNI()
      setPopularSNI(data)
    } catch (err) {
      console.error('Failed to load popular SNI domains:', err)
    }
  }

  const fetchUserConfig = async (email: string) => {
    if (!isConnected || !isAuthenticated) return
    
    setLoading(true)
    try {
      const config = await apiService.getVMessUserConfig(
        email, 
        configFormat, 
        customSNI || undefined
      )
      setUserConfig(config)
      setSelectedUser(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user config')
    } finally {
      setLoading(false)
    }
  }

  const downloadConfig = (config: any, filename: string) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchConfigFiles()
      fetchPopularSNI()
    }
  }, [isConnected, isAuthenticated])

  useEffect(() => {
    if (selectedConfigFile && isAuthenticated && isConnected) {
      fetchVMessUsers(selectedConfigFile)
    }
  }, [selectedConfigFile, isConnected, isAuthenticated])

  const filteredUsers = users.filter(user => {
    const cleanEmail = cleanEmailAddress(user.email)
    const matchesSearch = cleanEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && user.vmess_available) ||
      (filterActive === 'inactive' && !user.vmess_available)
    
    return matchesSearch && matchesFilter
  })

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">VMess Management</h1>
        <ErrorMessage message="Authentication required to access VMess management" variant="error" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">VMess Management</h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">VMess Management</h1>
        <div className="flex items-center space-x-3">
          {/* Config File Selector */}
          {configFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Config File:</label>
              <select
                value={selectedConfigFile}
                onChange={(e) => setSelectedConfigFile(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">All Config Files</option>
                {configFiles.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => fetchVMessUsers(selectedConfigFile)}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={() => fetchVMessUsers(selectedConfigFile)}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <Card title={
            <div className="flex items-center justify-between w-full">
              <span>VMess Users</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Total: {totalUsers}</span>
                {selectedConfigFile && (
                  <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
                    {selectedConfigFile}
                  </span>
                )}
              </div>
            </div>
          }>
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                  />
                </div>
                
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active VMess</option>
                  <option value="inactive">Inactive VMess</option>
                </select>
              </div>

              {loading ? (
                <Loading message="Loading users..." size="sm" />
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.email}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedUser === user.email
                          ? 'border-white bg-gray-800'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                      onClick={() => fetchUserConfig(cleanEmailAddress(user.email))}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{cleanEmailAddress(user.email)}</span>
                        <div className="flex space-x-1">
                          {user.vmess_available && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="VMess Available" />
                          )}
                          {user.has_subscription && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" title="Has Subscription" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        {user.uuid.substring(0, 8)}...
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      {searchTerm || filterActive !== 'all' 
                        ? 'No users match the filter' 
                        : selectedConfigFile 
                          ? `No users found in ${selectedConfigFile}` 
                          : 'No users found'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Config Display */}
        <div className="lg:col-span-2">
          <Card 
            title={selectedUser ? `Config for ${cleanEmailAddress(selectedUser)}` : 'Select a user'}
            action={
              selectedUser && (
                <div className="flex space-x-2">
                  <select
                    value={configFormat}
                    onChange={(e) => {
                      setConfigFormat(e.target.value as 'subscription' | 'decoded' | 'v2ray')
                      if (selectedUser) fetchUserConfig(selectedUser)
                    }}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-600"
                  >
                    <option value="v2ray">V2Ray</option>
                    <option value="decoded">Decoded</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
              )
            }
          >
            {selectedUser ? (
              <div className="space-y-4">
                {/* Custom SNI Input */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Custom SNI (for domain fronting)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g., m.zoom.us"
                      value={customSNI}
                      onChange={(e) => setCustomSNI(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600"
                    />
                    <button
                      onClick={() => selectedUser && fetchUserConfig(selectedUser)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {loading ? (
                  <Loading message="Loading config..." size="sm" />
                ) : userConfig ? (
                  <div className="space-y-4">
                    {/* Config Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (configFormat === 'subscription' && userConfig.vmess_link) {
                            copyToClipboard(userConfig.vmess_link)
                          } else if (userConfig.vmess_config || userConfig.v2ray_config) {
                            copyToClipboard(JSON.stringify(
                              userConfig.vmess_config || userConfig.v2ray_config,
                              null,
                              2
                            ))
                          }
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          if (userConfig.vmess_config || userConfig.v2ray_config) {
                            downloadConfig(
                              userConfig.vmess_config || userConfig.v2ray_config,
                              `${cleanEmailAddress(selectedUser!)}-${configFormat}.json`
                            )
                          }
                        }}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>

                    {/* Config Content */}
                    <div className="bg-gray-800 border border-gray-700 rounded p-4">
                      {configFormat === 'subscription' && userConfig.vmess_link ? (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Subscription Link:</p>
                          <div className="bg-black p-3 rounded font-mono text-sm break-all text-green-400">
                            {userConfig.vmess_link}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Configuration:</p>
                          <pre className="bg-black p-3 rounded text-sm overflow-x-auto text-green-400">
                            <code>
                              {JSON.stringify(
                                userConfig.vmess_config || userConfig.v2ray_config,
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        </div>
                      )}
                      
                      {userConfig.note && (
                        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600 rounded">
                          <p className="text-blue-400 text-sm">{userConfig.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Click "Apply" to load configuration</p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a user to view their VMess configuration</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Popular SNI Domains */}
      {popularSNI && (
        <Card title="Popular SNI Domains for Domain Fronting">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(popularSNI.popular_sni_domains).map(([provider, domains]) => (
              <div key={provider} className="space-y-2">
                <h4 className="text-white font-medium capitalize">{provider}</h4>
                <div className="space-y-1">
                  {domains.map((domain: string) => (
                    <button
                      key={domain}
                      onClick={() => setCustomSNI(domain)}
                      className="block w-full text-left px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition-colors text-sm font-mono"
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
            <p className="text-blue-400 text-sm">{popularSNI.note}</p>
          </div>
        </Card>
      )}
    </div>
  )
}