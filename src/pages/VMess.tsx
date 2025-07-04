import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Copy,
  Download,
  Search,
  Filter,
  ChevronDown,
  Users as UsersIcon,
  Settings,
} from "lucide-react";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { cleanEmailAddress, copyToClipboard } from "../utils";
import type {
  VMessUser,
  VMessConfigResponse,
  PopularSNIResponse,
} from "../types/api";

export const VMess = () => {
  const { isConnected, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<VMessUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userConfig, setUserConfig] = useState<VMessConfigResponse | null>(
    null
  );
  const [popularSNI, setPopularSNI] = useState<PopularSNIResponse | null>(null);
  const [configFiles, setConfigFiles] = useState<string[]>([]);
  const [selectedConfigFile, setSelectedConfigFile] = useState<string>("");
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [configFormat, setConfigFormat] = useState<
    "subscription" | "decoded" | "v2ray"
  >("v2ray");
  const [customSNI, setCustomSNI] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchConfigFiles = useCallback(async () => {
    if (!isConnected || !isAuthenticated) return;

    try {
      const configData = await apiService.getConfigFiles();
      const vmessFiles = configData.vmess_files;
      setConfigFiles(vmessFiles);

      // Auto-select the first VMess config file if available
      if (vmessFiles.length > 0 && !selectedConfigFile) {
        setSelectedConfigFile(vmessFiles[0]);
      }
    } catch (err) {
      console.error("Failed to load config files:", err);
    }
  }, [isConnected, isAuthenticated, selectedConfigFile]);

  const fetchVMessUsers = useCallback(
    async (configFile?: string) => {
      if (!isConnected || !isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiService.getVMessUsers(
          configFile || selectedConfigFile || undefined
        );
        setUsers(data.users);
        setTotalUsers(data.total_vmess_users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load VMess users"
        );
      } finally {
        setLoading(false);
      }
    },
    [isConnected, isAuthenticated, selectedConfigFile]
  );

  const fetchPopularSNI = useCallback(async () => {
    try {
      const data = await apiService.getPopularSNI();
      setPopularSNI(data);
    } catch (err) {
      console.error("Failed to load popular SNI domains:", err);
    }
  }, []);

  const fetchUserConfig = async (email: string) => {
    if (!isConnected || !isAuthenticated) return;

    setLoading(true);
    try {
      const config = await apiService.getVMessUserConfig(
        email,
        configFormat,
        customSNI || undefined
      );
      setUserConfig(config);
      setSelectedUser(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user config"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadConfig = (config: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchConfigFiles();
      fetchPopularSNI();
    }
  }, [isConnected, isAuthenticated, fetchConfigFiles, fetchPopularSNI]);

  useEffect(() => {
    if (selectedConfigFile && isAuthenticated && isConnected) {
      fetchVMessUsers(selectedConfigFile);
    }
  }, [selectedConfigFile, isConnected, isAuthenticated, fetchVMessUsers]);

  const filteredUsers = users.filter((user) => {
    const cleanEmail = cleanEmailAddress(user.email);
    const matchesSearch = cleanEmail
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && user.vmess_available) ||
      (filterActive === "inactive" && !user.vmess_available);

    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          VMess Management
        </h1>
        <ErrorMessage
          message="Authentication required to access VMess management"
          variant="error"
        />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          VMess Management
        </h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          VMess Management
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Config File Selector - Mobile Responsive */}
          {configFiles.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                Config:
              </label>
              <select
                value={selectedConfigFile}
                onChange={(e) => setSelectedConfigFile(e.target.value)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="">All Files</option>
                {configFiles.map((file) => (
                  <option key={file} value={file}>
                    {file.length > 20 ? `${file.substring(0, 20)}...` : file}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => fetchVMessUsers(selectedConfigFile)}
            disabled={loading}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchVMessUsers(selectedConfigFile)}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Mobile/Desktop Layout */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">VMess Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-gray-400">
                    {totalUsers}
                    <span className="hidden sm:inline"> total</span>
                  </span>
                  {selectedConfigFile && (
                    <span className="px-1.5 py-0.5 bg-purple-900 text-purple-300 text-xs rounded max-w-20 truncate">
                      {selectedConfigFile.split("_")[0]}
                    </span>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Search and Filter */}
              <div className="space-y-2 sm:space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-xs sm:text-sm"
                  />
                </div>

                {/* Filter Toggle for Mobile */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>
                        Filter:{" "}
                        {filterActive === "all"
                          ? "All Users"
                          : filterActive === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showFilters && (
                    <div className="mt-2 space-y-1 bg-gray-800 border border-gray-700 rounded p-2">
                      {[
                        { value: "all", label: "All Users" },
                        { value: "active", label: "Active VMess" },
                        { value: "inactive", label: "Inactive VMess" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilterActive(
                              option.value as typeof filterActive
                            );
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            filterActive === option.value
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Filter */}
                <select
                  value={filterActive}
                  onChange={(e) =>
                    setFilterActive(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="hidden sm:block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-gray-600 text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active VMess</option>
                  <option value="inactive">Inactive VMess</option>
                </select>
              </div>

              {/* Users List */}
              {loading ? (
                <Loading message="Loading users..." size="sm" />
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.email}
                      className={`p-2 sm:p-3 border rounded cursor-pointer transition-colors ${
                        selectedUser === user.email
                          ? "border-white bg-gray-800"
                          : "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                      }`}
                      onClick={() =>
                        fetchUserConfig(cleanEmailAddress(user.email))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-xs sm:text-sm font-medium truncate block">
                            {cleanEmailAddress(user.email)}
                          </span>
                          <div className="text-xs text-gray-400 mt-1 font-mono">
                            {user.uuid.substring(0, 8)}...
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          {user.vmess_available && (
                            <span
                              className="w-2 h-2 bg-green-500 rounded-full"
                              title="VMess Available"
                            />
                          )}
                          {user.has_subscription && (
                            <span
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              title="Has Subscription"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <p className="text-gray-400 text-center py-4 text-sm">
                      {searchTerm || filterActive !== "all"
                        ? "No users match the filter"
                        : selectedConfigFile
                        ? `No users in ${selectedConfigFile}`
                        : "No users found"}
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
            title={
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  {selectedUser ? (
                    <>
                      <span className="hidden sm:inline">Config for </span>
                      <span className="sm:hidden">Config: </span>
                      <span className="truncate">
                        {cleanEmailAddress(selectedUser)}
                      </span>
                    </>
                  ) : (
                    "Select a user"
                  )}
                </span>
              </div>
            }
            action={
              selectedUser && (
                <select
                  value={configFormat}
                  onChange={(e) => {
                    setConfigFormat(
                      e.target.value as "subscription" | "decoded" | "v2ray"
                    );
                    if (selectedUser) fetchUserConfig(selectedUser);
                  }}
                  className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-gray-600"
                >
                  <option value="v2ray">V2Ray</option>
                  <option value="decoded">Decoded</option>
                  <option value="subscription">Subscription</option>
                </select>
              )
            }
          >
            {selectedUser ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Custom SNI Input */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">
                    Custom SNI
                    <span className="hidden sm:inline">
                      (for domain fronting)
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      placeholder="e.g., m.zoom.us"
                      value={customSNI}
                      onChange={(e) => setCustomSNI(e.target.value)}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-xs sm:text-sm"
                    />
                    <button
                      onClick={() =>
                        selectedUser && fetchUserConfig(selectedUser)
                      }
                      disabled={loading}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {loading ? (
                  <Loading message="Loading config..." size="sm" />
                ) : userConfig ? (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Config Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => {
                          if (
                            configFormat === "subscription" &&
                            userConfig.vmess_link
                          ) {
                            copyToClipboard(userConfig.vmess_link);
                          } else if (
                            userConfig.vmess_config ||
                            userConfig.v2ray_config
                          ) {
                            copyToClipboard(
                              JSON.stringify(
                                userConfig.vmess_config ||
                                  userConfig.v2ray_config,
                                null,
                                2
                              )
                            );
                          }
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Copy</span>
                      </button>

                      <button
                        onClick={() => {
                          if (
                            userConfig.vmess_config ||
                            userConfig.v2ray_config
                          ) {
                            downloadConfig(
                              userConfig.vmess_config ||
                                userConfig.v2ray_config,
                              `${cleanEmailAddress(
                                selectedUser!
                              )}-${configFormat}.json`
                            );
                          }
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Download</span>
                      </button>
                    </div>

                    {/* Config Content */}
                    <div className="bg-gray-800 border border-gray-700 rounded p-3 sm:p-4">
                      {configFormat === "subscription" &&
                      userConfig.vmess_link ? (
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2">
                            Subscription Link:
                          </p>
                          <div className="bg-black p-2 sm:p-3 rounded font-mono text-xs break-all text-green-400 overflow-x-auto">
                            {userConfig.vmess_link}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-2">
                            Configuration:
                          </p>
                          <pre className="bg-black p-2 sm:p-3 rounded text-xs overflow-x-auto text-green-400 max-h-64 sm:max-h-96 overflow-y-auto">
                            <code>
                              {JSON.stringify(
                                userConfig.vmess_config ||
                                  userConfig.v2ray_config,
                                null,
                                2
                              )}
                            </code>
                          </pre>
                        </div>
                      )}

                      {userConfig.note && (
                        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-600 rounded">
                          <p className="text-blue-400 text-xs sm:text-sm">
                            {userConfig.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Click "Apply" to load configuration
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  Select a user to view their VMess configuration
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Popular SNI Domains */}
      {popularSNI && (
        <Card title="Popular SNI Domains">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Object.entries(popularSNI.popular_sni_domains).map(
              ([provider, domains]) => (
                <div key={provider} className="space-y-2">
                  <h4 className="text-white font-medium capitalize text-sm sm:text-base">
                    {provider}
                  </h4>
                  <div className="space-y-1">
                    {domains.map((domain: string) => (
                      <button
                        key={domain}
                        onClick={() => setCustomSNI(domain)}
                        className="block w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition-colors text-xs sm:text-sm font-mono"
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-4 p-2 sm:p-3 bg-blue-900/20 border border-blue-600 rounded">
            <p className="text-blue-400 text-xs sm:text-sm">
              {popularSNI.note}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
