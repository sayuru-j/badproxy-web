import { useState, useEffect } from 'react'
import { 
  FileText, 
  Folder, 
  Users,
  Shield,
  HardDrive,
  RefreshCw
} from 'lucide-react'
import { Card } from '../components/Card'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { formatFileSize } from '../utils'
import type { ConfigFilesResponse, ConfigFile } from '../types/api'

export const Config = () => {
  const { isConnected, isAuthenticated } = useAuth()
  const [configData, setConfigData] = useState<ConfigFilesResponse | null>(null)
  const [selectedFile, setSelectedFile] = useState<ConfigFile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigFiles = async () => {
    if (!isConnected || !isAuthenticated) return
    
    setLoading(true)
    setError(null)

    try {
      const data = await apiService.getConfigFiles()
      setConfigData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config files')
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (file: ConfigFile) => {
    if (file.is_vmess) {
      return <Shield className="w-5 h-5 text-purple-500" />
    }
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchConfigFiles()
    }
  }, [isConnected, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Configuration Management</h1>
        <ErrorMessage message="Authentication required to access configuration management" variant="error" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Configuration Management</h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Configuration Management</h1>
        <button
          onClick={fetchConfigFiles}
          disabled={!isAuthenticated}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={fetchConfigFiles}
          onDismiss={() => setError(null)}
        />
      )}

      {loading && !configData ? (
        <Loading message="Loading configuration files..." />
      ) : configData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Overview */}
          <div className="lg:col-span-1">
            <Card title="Configuration Overview">
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">{configData.total_files}</p>
                    <p className="text-sm text-gray-400">Total Files</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-white">{configData.vmess_files.length}</p>
                    <p className="text-sm text-gray-400">VMess Files</p>
                  </div>
                </div>

                {/* Config Path */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Configuration Path</p>
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded">
                    <Folder className="w-4 h-4 text-yellow-500" />
                    <code className="text-sm text-white break-all">{configData.config_path}</code>
                  </div>
                </div>

                {/* VMess Files Quick List */}
                {configData.vmess_files.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">VMess Configuration Files</p>
                    <div className="space-y-1">
                      {configData.vmess_files.map((filename) => (
                        <div key={filename} className="flex items-center space-x-2 p-2 bg-purple-900/20 border border-purple-600 rounded">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 text-sm font-mono">{filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* File List */}
          <div className="lg:col-span-2">
            <Card title="Configuration Files">
              {configData.json_files.length > 0 ? (
                <div className="space-y-3">
                  {configData.json_files.map((file) => (
                    <div
                      key={file.filename}
                      className={`p-4 border rounded cursor-pointer transition-all ${
                        selectedFile?.filename === file.filename
                          ? 'border-white bg-gray-800'
                          : file.is_vmess
                          ? 'border-purple-600 bg-purple-900/10 hover:bg-purple-900/20'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <h4 className="text-white font-medium">{file.filename}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-400">
                                Size: {formatFileSize(file.size)}
                              </span>
                              {file.client_count !== null && (
                                <span className="text-sm text-gray-400">
                                  Clients: {file.client_count}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded ${
                                file.exists ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                              }`}>
                                {file.exists ? 'Exists' : 'Missing'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {file.is_vmess && (
                            <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
                              VMess
                            </span>
                          )}
                          {file.client_count && file.client_count > 0 && (
                            <div className="flex items-center space-x-1 text-blue-400">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{file.client_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No configuration files found</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading configuration files...</p>
        </div>
      )}

      {/* File Details */}
      {selectedFile && (
        <Card title={`File Details: ${selectedFile.filename}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-800 rounded">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{selectedFile.filename}</p>
              <p className="text-sm text-gray-400">Filename</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded">
              <HardDrive className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{formatFileSize(selectedFile.size)}</p>
              <p className="text-sm text-gray-400">File Size</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded">
              {selectedFile.is_vmess ? (
                <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              ) : (
                <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              )}
              <p className="text-lg font-bold text-white">
                {selectedFile.is_vmess ? 'VMess' : 'Other'}
              </p>
              <p className="text-sm text-gray-400">Type</p>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {selectedFile.client_count || 0}
              </p>
              <p className="text-sm text-gray-400">Clients</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <h4 className="text-white font-medium mb-3">File Properties</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Exists:</span>
                <span className={`ml-2 ${selectedFile.exists ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedFile.exists ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">VMess Config:</span>
                <span className={`ml-2 ${selectedFile.is_vmess ? 'text-purple-500' : 'text-gray-500'}`}>
                  {selectedFile.is_vmess ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">File Size:</span>
                <span className="ml-2 text-white">{formatFileSize(selectedFile.size)}</span>
              </div>
              <div>
                <span className="text-gray-400">Client Count:</span>
                <span className="ml-2 text-white">{selectedFile.client_count || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}