import { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  NotepadText,
  Terminal,
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

  const serviceOptions = [
    { value: "xray", label: "XRay" },
    { value: "v2ray", label: "V2Ray" },
    { value: "nginx", label: "Nginx" },
    { value: "access", label: "Access Logs" },
    { value: "error", label: "Error Logs" },
  ];

  const fetchServices = async () => {
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
  };

  const fetchLogs = async (
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
  };

  const renewCertificate = async () => {
    if (!isConnected || !isAuthenticated) return;

    setRenewingCert(true);
    setError(null);

    try {
      const response = await apiService.renewCertificate();
      if (response.success) {
        // You could add a success notification here
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
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      fetchLogs(selectedService, logLines);
    }
  }, [selectedService, logLines, isAuthenticated, isConnected]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">System Management</h1>
        <ErrorMessage message="Authentication required to access system management" variant="error" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">System Management</h1>
        <ErrorMessage message="Not connected to API" variant="error" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={renewCertificate}
            disabled={renewingCert || !isAuthenticated}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <NotepadText
              className={`w-4 h-4 ${renewingCert ? "animate-spin" : ""}`}
            />
            <span>{renewingCert ? "Renewing..." : "Renew Certificate"}</span>
          </button>
          <button
            onClick={fetchServices}
            disabled={!isAuthenticated}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Information */}
        <Card title="System Information">
          {systemInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Version</p>
                  <p className="text-white font-medium">{systemInfo.version}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">VMess Status</p>
                  <div className="flex items-center space-x-2">
                    {systemInfo.vmess_enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={
                        systemInfo.vmess_enabled
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {systemInfo.vmess_enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Config Path</p>
                <code className="bg-gray-800 px-3 py-2 rounded text-sm block break-all">
                  {systemInfo.config_path}
                </code>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Installed Protocols
                </p>
                <div className="flex flex-wrap gap-2">
                  {systemInfo.installed_protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-3 py-1 bg-blue-900 text-blue-300 rounded text-sm"
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
        <Card title="Services Status">
          {loading && services.length === 0 ? (
            <Loading message="Loading services..." size="sm" />
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    {service.status === "running" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : service.status === "stopped" ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {service.service}
                      </p>
                      <p className="text-sm text-gray-400">
                        Status:{" "}
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
                      <p className="text-sm text-gray-400">
                        PID: {service.pid}
                      </p>
                    )}
                    {service.uptime && (
                      <p className="text-xs text-gray-500">
                        Uptime: {service.uptime}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {services.length === 0 && !loading && (
                <p className="text-gray-400 text-center py-4">
                  No services information available
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* System Logs */}
      <Card
        title="System Logs"
        action={
          <div className="flex items-center space-x-3">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-600"
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
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-gray-600"
            >
              <option value={50}>50 lines</option>
              <option value={100}>100 lines</option>
              <option value={200}>200 lines</option>
              <option value={500}>500 lines</option>
            </select>

            {logs && (
              <button
                onClick={downloadLogs}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        }
      >
        {loading ? (
          <Loading message={`Loading ${selectedService} logs...`} size="sm" />
        ) : logs ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>
                Service: <span className="text-white">{logs.service}</span>
              </span>
              <span>
                Lines: <span className="text-white">{logs.lines}</span>
              </span>
            </div>

            <div className="bg-black border border-gray-700 rounded">
              <pre className="p-4 text-sm text-green-400 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                {logs.logs}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Select a service to view logs</p>
          </div>
        )}
      </Card>
    </div>
  );
};