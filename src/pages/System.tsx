import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  NotepadText,
  Terminal,
  Settings,
  Activity,
  ChevronDown,
  Monitor
} from "lucide-react";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import type { ServiceStatus, LogsResponse } from "../types/api";

export const System = () => {
  const { isConnected, systemInfo, isAuthenticated } = useAuth();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [selectedService, setSelectedService] = useState<string>("xray");
  const [logLines, setLogLines] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [renewingCert, setRenewingCert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogControls, setShowLogControls] = useState(false);

  const serviceOptions = [
    { value: "xray", label: "XRay" },
    { value: "v2ray", label: "V2Ray" },
    { value: "nginx", label: "Nginx" },
    { value: "access", label: "Access Logs" },
    { value: "error", label: "Error Logs" },
  ];

  const logLineOptions = [
    { value: 50, label: "50 lines" },
    { value: 100, label: "100 lines" },
    { value: 200, label: "200 lines" },
    { value: 500, label: "500 lines" },
  ];

  const fetchServices = useCallback(async () => {
    if (!isConnected || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getSystemServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [isConnected, isAuthenticated]);

  const fetchLogs = useCallback(async (
    service: string = selectedService,
    lines: number = logLines
  ) => {
    if (!isConnected || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getSystemLogs(service, lines);
      setLogs(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to load ${service} logs`
      );
    } finally {
      setLoading(false);
    }
  }, [isConnected, isAuthenticated, selectedService, logLines]);

  const renewCertificate = async () => {
    if (!isConnected || !isAuthenticated) return;

    setRenewingCert(true);
    setError(null);

    try {
      const response = await apiService.renewCertificate();
      if (response.success) {
        console.log('Certificate renewal initiated successfully');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to renew certificate"
      );
    } finally {
      setRenewingCert(false);
    }
  };

  const downloadLogs = () => {
    if (!logs) return;

    const blob = new Blob([logs.logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logs.service}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchServices();
      fetchLogs();
    }
  }, [isAuthenticated, isConnected, fetchServices, fetchLogs]);

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchLogs(selectedService, logLines);
    }
  }, [selectedService, logLines, isAuthenticated, isConnected, fetchLogs]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">System Management</h1>
        <ErrorMessage message="Authentication required to access system management" variant="error" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">System Management</h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-white">System Management</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={renewCertificate}
            disabled={renewingCert || !isAuthenticated}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
          >
            <NotepadText
              className={`w-3 h-3 sm:w-4 sm:h-4 ${renewingCert ? "animate-spin" : ""}`}
            />
            <span>{renewingCert ? "Renewing..." : "Renew Certificate"}</span>
          </button>
          <button
            onClick={fetchServices}
            disabled={!isAuthenticated || loading}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => {
            fetchServices();
            fetchLogs();
          }}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Content Grid */}
      <div className="space-y-4 sm:space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* System Information */}
        <Card title={
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">System Information</span>
          </div>
        }>
          {systemInfo ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Version and VMess Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Version</p>
                  <p className="text-white font-medium text-sm sm:text-base">{systemInfo.version}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">VMess Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {systemInfo.vmess_enabled ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    )}
                    <span
                      className={`text-xs sm:text-sm ${
                        systemInfo.vmess_enabled
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {systemInfo.vmess_enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Config Path */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">Config Path</p>
                <div className="p-2 sm:p-3 bg-gray-800 rounded">
                  <code className="text-white text-xs break-all block">
                    {systemInfo.config_path}
                  </code>
                </div>
              </div>

              {/* Installed Protocols */}
              <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-2">
                  Installed Protocols
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {systemInfo.installed_protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs"
                    >
                      {protocol.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Loading message="Loading system info..." size="sm" />
          )}
        </Card>

        {/* Services Status */}
        <Card title={
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Services Status</span>
          </div>
        }>
          {loading && services.length === 0 ? (
            <Loading message="Loading services..." size="sm" />
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {services.map((service) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between p-2 sm:p-3 lg:p-4 bg-gray-800 rounded border border-gray-700"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {service.status === "running" ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : service.status === "stopped" ? (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">
                        {service.service}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        <span className="hidden sm:inline">Status: </span>
                        <span
                          className={
                            service.status === "running"
                              ? "text-green-500"
                              : service.status === "stopped"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }
                        >
                          {service.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {service.pid && (
                      <p className="text-xs sm:text-sm text-gray-400">
                        PID: {service.pid}
                      </p>
                    )}
                    {service.uptime && (
                      <p className="text-xs text-gray-500">
                        <span className="hidden sm:inline">Uptime: </span>
                        {service.uptime}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {services.length === 0 && !loading && (
                <p className="text-gray-400 text-center py-4 text-sm">
                  No services information available
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* System Logs */}
      <Card
        title={
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">System Logs</span>
          </div>
        }
        action={
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Log Controls Toggle */}
            <button
              onClick={() => setShowLogControls(!showLogControls)}
              className="sm:hidden flex items-center space-x-1 px-2 py-1 bg-gray-800 text-white rounded text-xs"
            >
              <Settings className="w-3 h-3" />
              <ChevronDown className={`w-3 h-3 transition-transform ${showLogControls ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center space-x-3">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-gray-600"
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={logLines}
                onChange={(e) => setLogLines(Number(e.target.value))}
                className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-gray-600"
              >
                {logLineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {logs && (
                <button
                  onClick={downloadLogs}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Mobile Log Controls */}
        {showLogControls && (
          <div className="sm:hidden mb-4 p-3 bg-gray-800 border border-gray-700 rounded space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Service:</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-gray-500"
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Lines:</label>
              <select
                value={logLines}
                onChange={(e) => setLogLines(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-gray-500"
              >
                {logLineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {logs && (
              <button
                onClick={downloadLogs}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Logs</span>
              </button>
            )}
          </div>
        )}

        {/* Log Content */}
        {loading ? (
          <Loading message={`Loading ${selectedService} logs...`} size="sm" />
        ) : logs ? (
          <div className="space-y-3">
            {/* Log Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-400">
              <span>
                Service: <span className="text-white">{logs.service}</span>
              </span>
              <span>
                Lines: <span className="text-white">{logs.lines}</span>
              </span>
            </div>

            {/* Log Display */}
            <div className="bg-black border border-gray-700 rounded">
              <pre className="p-2 sm:p-3 lg:p-4 text-xs sm:text-sm text-green-400 overflow-x-auto whitespace-pre-wrap max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                {logs.logs}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <Terminal className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Select a service to view logs</p>
          </div>
        )}
      </Card>
    </div>
  );
};