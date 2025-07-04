import { useState, useEffect, useCallback } from 'react'
import { 
  FileText, 
  Folder, 
  Users,
  Shield,
  HardDrive,
  RefreshCw,
  Info,
  ChevronRight,
  Eye,
  Settings as SettingsIcon
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
  const [showOverview, setShowOverview] = useState(true)

  const fetchConfigFiles = useCallback(async () => {
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
  }, [isConnected, isAuthenticated])

  const getFileIcon = (file: ConfigFile) => {
    if (file.is_vmess) {
      return <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
    }
    return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
  }

  const getFileStatusColor = (file: ConfigFile) => {
    return file.exists ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
  }

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchConfigFiles()
    }
  }, [isConnected, isAuthenticated, fetchConfigFiles])

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Configuration Management</h1>
        <ErrorMessage message="Authentication required to access configuration management" variant="error" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Configuration Management</h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Configuration Management</h1>
        <button
          onClick={fetchConfigFiles}
          disabled={!isAuthenticated || loading}
          className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
        >
          <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={fetchConfigFiles}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading State */}
      {loading && !configData ? (
        <Loading message="Loading configuration files..." />
      ) : configData ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Overview Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowOverview(!showOverview)}
              className="flex items-center justify-between w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-white font-medium text-sm">Configuration Overview</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showOverview ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Config Overview - Responsive visibility */}
            <div className={`lg:col-span-1 ${showOverview ? 'block' : 'hidden lg:block'}`}>
              <Card title={
                <div className="flex items-center space-x-2">
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Configuration Overview</span>
                </div>
              }>
                <div className="space-y-3 sm:space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-gray-800 rounded">
                      <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
                      <p className="text-lg sm:text-xl font-bold text-white">{configData.total_files}</p>
                      <p className="text-xs sm:text-sm text-gray-400">Total Files</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-gray-800 rounded">
                      <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
                      <p className="text-lg sm:text-xl font-bold text-white">{configData.vmess_files.length}</p>
                      <p className="text-xs sm:text-sm text-gray-400">VMess Files</p>
                    </div>
                  </div>

                  {/* Config Path */}
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">Configuration Path</p>
                    <div className="flex items-start space-x-2 p-2 sm:p-3 bg-gray-800 rounded">
                      <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <code className="text-xs sm:text-sm text-white break-all flex-1">
                        {configData.config_path}
                      </code>
                    </div>
                  </div>

                  {/* VMess Files Quick List */}
                  {configData.vmess_files.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-2">VMess Configuration Files</p>
                      <div className="space-y-1 sm:space-y-2">
                        {configData.vmess_files.slice(0, 3).map((filename) => (
                          <div key={filename} className="flex items-center space-x-2 p-1.5 sm:p-2 bg-purple-900/20 border border-purple-600 rounded">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                            <span className="text-purple-300 text-xs sm:text-sm font-mono truncate">
                              {filename.length > 25 ? `${filename.substring(0, 25)}...` : filename}
                            </span>
                          </div>
                        ))}
                        {configData.vmess_files.length > 3 && (
                          <div className="text-center p-1">
                            <span className="text-xs text-gray-400">
                              +{configData.vmess_files.length - 3} more files
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* File List */}
            <div className="lg:col-span-2">
              <Card title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Configuration Files</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400">
                    {configData.json_files.length} files
                  </span>
                </div>
              }>
                {configData.json_files.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {configData.json_files.map((file) => (
                      <div
                        key={file.filename}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedFile?.filename === file.filename
                            ? 'border-white bg-gray-800'
                            : file.is_vmess
                            ? 'border-purple-600 bg-purple-900/10 hover:bg-purple-900/20'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        {/* Mobile Layout */}
                        <div className="sm:hidden space-y-2">
                          <div className="flex items-start space-x-3">
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">{file.filename}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${getFileStatusColor(file)}`}>
                                  {file.exists ? 'Exists' : 'Missing'}
                                </span>
                                {file.is_vmess && (
                                  <span className="px-2 py-0.5 bg-purple-900 text-purple-300 text-xs rounded">
                                    VMess
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedFile?.filename === file.filename && (
                              <Eye className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 pl-7">
                            <span>Size: {formatFileSize(file.size)}</span>
                            {file.client_count !== null && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{file.client_count}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:block">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {getFileIcon(file)}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">{file.filename}</h4>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-400">
                                    Size: {formatFileSize(file.size)}
                                  </span>
                                  {file.client_count !== null && (
                                    <span className="text-sm text-gray-400">
                                      Clients: {file.client_count}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded ${getFileStatusColor(file)}`}>
                                    {file.exists ? 'Exists' : 'Missing'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
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
                              {selectedFile?.filename === file.filename && (
                                <Eye className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No configuration files found</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* File Details */}
          {selectedFile && (
            <Card title={`File Details: ${selectedFile.filename}`}>
              {/* Mobile Layout */}
              <div className="sm:hidden space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white truncate">{selectedFile.filename}</p>
                    <p className="text-xs text-gray-400">Filename</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <HardDrive className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">{formatFileSize(selectedFile.size)}</p>
                    <p className="text-xs text-gray-400">File Size</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    {selectedFile.is_vmess ? (
                      <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    ) : (
                      <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-bold text-white">
                      {selectedFile.is_vmess ? 'VMess' : 'Other'}
                    </p>
                    <p className="text-xs text-gray-400">Type</p>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">
                      {selectedFile.client_count || 0}
                    </p>
                    <p className="text-xs text-gray-400">Clients</p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center p-4 bg-gray-800 rounded">
                    <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-lg font-bold text-white truncate">{selectedFile.filename}</p>
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
              </div>
              
              {/* File Properties */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-800 rounded">
                <h4 className="text-white font-medium mb-3 text-sm sm:text-base">File Properties</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
      ) : (
        <div className="text-center py-8 sm:py-12">
          <Folder className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading configuration files...</p>
        </div>
      )}
    </div>
  )
}