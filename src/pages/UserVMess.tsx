import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Copy,
  Download,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { cleanEmailAddress, copyToClipboard } from "../utils";
import type {
  VMessConfigResponse,
  PopularSNIResponse,
  ServiceStatus,
} from "../types/api";

export const UserVMess = () => {
  const { isConnected, isAuthenticated, user } = useAuth();
  const [userConfig, setUserConfig] = useState<VMessConfigResponse | null>(
    null
  );
  const [popularSNI, setPopularSNI] = useState<PopularSNIResponse | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [configFormat, setConfigFormat] = useState<
    "subscription" | "decoded" | "v2ray"
  >("v2ray");
  const [customSNI, setCustomSNI] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularSNI = useCallback(async () => {
    try {
      const data = await apiService.getPopularSNI();
      setPopularSNI(data);
    } catch (err) {
      console.error("Failed to load popular SNI domains:", err);
    }
  }, []);

  const fetchUserConfig = async () => {
    if (!isConnected || !isAuthenticated || !user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const config = await apiService.getVMessUserConfig(
        user.email,
        configFormat,
        customSNI || undefined
      );
      setUserConfig(config);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your VMess config"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = useCallback(async () => {
    if (!isConnected || !isAuthenticated) return;

    setServicesLoading(true);

    try {
      const data = await apiService.getSystemServices();
      // Filter to only show essential services that users should know about
      const essentialServices = data.filter((service) =>
        ["xray", "v2ray", "nginx", "badproxy"].some((essential) =>
          service.service.toLowerCase().includes(essential)
        )
      );
      setServices(essentialServices);
    } catch (err) {
      console.error("Failed to load services:", err);
      // Don't show error for services as it's secondary info
    } finally {
      setServicesLoading(false);
    }
  }, [isConnected, isAuthenticated]);

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
      fetchPopularSNI();
      fetchServices();
    }
  }, [isConnected, isAuthenticated, fetchPopularSNI, fetchServices]);

  useEffect(() => {
    if (user?.email && isAuthenticated && isConnected) {
      fetchUserConfig();
    }
  }, [configFormat, user?.email, isAuthenticated, isConnected]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          My VMess Config
        </h1>
        <ErrorMessage
          message="Please log in to view your VMess configuration"
          variant="error"
        />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          My VMess Config
        </h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            My VMess Configuration
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage your personal VMess connection settings
          </p>
        </div>

        {/* User Info Badge */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <UserIcon className="w-4 h-4 text-blue-500" />
          <span className="text-white text-sm">
            {cleanEmailAddress(user?.email || "")}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchUserConfig}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Content Grid */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Service Status - Simplified */}
        <div className="lg:col-span-1">
          <Card
            title={
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Service Status</span>
              </div>
            }
          >
            {servicesLoading ? (
              <Loading message="Checking services..." size="sm" />
            ) : (
              <div className="space-y-3">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service.service}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        {service.status === "running" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : service.status === "stopped" ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm capitalize">
                            {service.service}
                          </p>
                          <p
                            className={`text-xs ${
                              service.status === "running"
                                ? "text-green-500"
                                : service.status === "stopped"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {service.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      No service information available
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* VMess Config Display */}
        <div className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  Your VMess Configuration
                </span>
              </div>
            }
            action={
              <select
                value={configFormat}
                onChange={(e) => {
                  setConfigFormat(
                    e.target.value as "subscription" | "decoded" | "v2ray"
                  );
                }}
                className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="v2ray">V2Ray</option>
                <option value="decoded">Decoded</option>
                <option value="subscription">Subscription</option>
              </select>
            }
          >
            <div className="space-y-4">
              {/* Custom SNI Input */}
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-2">
                  Custom SNI{" "}
                  <span className="text-gray-500">
                    (optional, for domain fronting)
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., m.zoom.us"
                    value={customSNI}
                    onChange={(e) => setCustomSNI(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 text-sm"
                  />
                  <button
                    onClick={fetchUserConfig}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Apply</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <Loading message="Loading your configuration..." size="sm" />
              ) : userConfig ? (
                <div className="space-y-4">
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
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Config</span>
                    </button>

                    <button
                      onClick={() => {
                        if (
                          userConfig.vmess_config ||
                          userConfig.v2ray_config
                        ) {
                          downloadConfig(
                            userConfig.vmess_config || userConfig.v2ray_config,
                            `${cleanEmailAddress(
                              user?.email || "user"
                            )}-${configFormat}.json`
                          );
                        }
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>

                  {/* Config Content */}
                  <div className="bg-gray-800 border border-gray-700 rounded p-4">
                    {configFormat === "subscription" &&
                    userConfig.vmess_link ? (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">
                          Subscription Link:
                        </p>
                        <div className="bg-black p-3 rounded font-mono text-xs break-all text-green-400 overflow-x-auto">
                          {userConfig.vmess_link}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">
                          Configuration JSON:
                        </p>
                        <pre className="bg-black p-3 rounded text-xs overflow-x-auto text-green-400 max-h-96 overflow-y-auto">
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
                      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600 rounded">
                        <p className="text-blue-400 text-sm">
                          {userConfig.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-2">
                    Your VMess configuration will appear here
                  </p>
                  <button
                    onClick={fetchUserConfig}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Load Configuration
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Popular SNI Domains */}
      {popularSNI && (
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Popular SNI Domains</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(popularSNI.popular_sni_domains).map(
              ([provider, domains]) => (
                <div key={provider} className="space-y-2">
                  <h4 className="text-white font-medium capitalize text-sm">
                    {provider}
                  </h4>
                  <div className="space-y-1">
                    {domains.map((domain: string) => (
                      <button
                        key={domain}
                        onClick={() => setCustomSNI(domain)}
                        className="block w-full text-left px-3 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white transition-colors text-xs font-mono"
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
            <p className="text-blue-400 text-sm">{popularSNI.note}</p>
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      <Card title="How to Use Your VMess Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">📱 Mobile Apps</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                • <strong>V2RayNG (Android):</strong> Copy the subscription link
                or import the V2Ray JSON
              </p>
              <p>
                • <strong>Fair VPN (iOS):</strong> Use the subscription link in
                app settings
              </p>
              <p>
                • <strong>ShadowLink (iOS):</strong> Import V2Ray configuration
                directly
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">💻 Desktop Clients</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                • <strong>V2RayN (Windows):</strong> Import the V2Ray JSON
                configuration
              </p>
              <p>
                • <strong>V2RayU (macOS):</strong> Use subscription link or JSON
                import
              </p>
              <p>
                • <strong>Qv2ray:</strong> Cross-platform, supports JSON import
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded">
          <p className="text-yellow-400 text-sm">
            💡 <strong>Tip:</strong> Use Custom SNI domains for better
            connectivity in restricted networks. Popular choices include
            zoom.us, microsoft.com, and cloudflare.com domains.
          </p>
        </div>
      </Card>
    </div>
  );
};
