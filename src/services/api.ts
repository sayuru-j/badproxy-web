import axios, { AxiosError } from "axios";
import type {
  SystemInfo,
  ServiceStatus,
  LogsResponse,
  VMessUsersResponse,
  VMessConfigResponse,
  CustomVMessRequest,
  CustomVMessResponse,
  PopularSNIResponse,
  ConfigFilesResponse,
  ApiResponse,
  ApiError,
  HealthResponse,
} from "../types/api";

// Additional types for authentication
interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

interface ApiKeyResponse {
  message: string;
  key_name: string;
  api_key: string;
  note: string;
}

interface AuthInfoResponse {
  auth_methods: string[];
  token_endpoint: string;
  api_key_header: string;
  default_credentials: {
    username: string;
    note: string;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://20.6.92.66:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken: string | null = null;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(
      `🔗 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );

    // Add auth token if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Add timestamp for debugging
    config.headers["X-Request-Time"] = new Date().toISOString();

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("🔒 Authentication failed - dispatching auth-expired event");
      authToken = null;
      localStorage.removeItem("badproxy_token");
      localStorage.removeItem("badproxy_user");
      localStorage.removeItem("badproxy_token_expiry");

      // Dispatch custom event for auth expiry
      window.dispatchEvent(
        new CustomEvent("auth-expired", {
          detail: { error: error.response?.data },
        })
      );
    }

    // Handle forbidden errors
    if (error.response?.status === 403) {
      console.warn("🚫 Access forbidden - insufficient permissions");
      window.dispatchEvent(
        new CustomEvent("access-denied", {
          detail: { error: error.response?.data },
        })
      );
    }

    // Handle server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error("🔥 Server error detected");
      window.dispatchEvent(
        new CustomEvent("server-error", {
          detail: {
            error: error.response?.data,
            status: error.response.status,
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // ================================
  // AUTH TOKEN MANAGEMENT
  // ================================

  setAuthToken(token: string) {
    authToken = token;
    console.log("🔑 Auth token set");
  },

  clearAuthToken() {
    authToken = null;
    console.log("🔑 Auth token cleared");
  },

  getAuthToken() {
    return authToken;
  },

  // ================================
  // AUTHENTICATION ENDPOINTS
  // ================================

  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post<LoginResponse>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>("/auth/register", userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async updateUser(
    userId: number,
    userData: Partial<RegisterRequest>
  ): Promise<User> {
    const response = await api.put<User>(`/auth/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/auth/users/${userId}`);
    return response.data;
  },

  async toggleUserStatus(userId: number): Promise<User> {
    const response = await api.patch<User>(
      `/auth/users/${userId}/toggle-status`
    );
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/auth/users");
    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async generateApiKey(keyName: string): Promise<ApiKeyResponse> {
    const response = await api.post<ApiKeyResponse>(
      `/auth/api-key/generate`,
      null,
      {
        params: { key_name: keyName },
      }
    );
    return response.data;
  },

  async getAuthInfo(): Promise<AuthInfoResponse> {
    const response = await api.get<AuthInfoResponse>("/auth/auth-info");
    return response.data;
  },

  // ================================
  // HEALTH CHECK (PUBLIC)
  // ================================

  async health(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/");
    return response.data;
  },

  // ================================
  // SYSTEM MANAGEMENT (AUTHENTICATED)
  // ================================

  async getSystemStatus(): Promise<SystemInfo> {
    const response = await api.get<SystemInfo>("/system/status");
    return response.data;
  },

  async getSystemServices(): Promise<ServiceStatus[]> {
    const response = await api.get<ServiceStatus[]>("/system/services");
    return response.data;
  },

  async getSystemLogs(
    service: string,
    lines: number = 100
  ): Promise<LogsResponse> {
    // Validate parameters
    if (!service) {
      throw new Error("Service name is required");
    }

    if (lines < 1 || lines > 1000) {
      throw new Error("Lines must be between 1 and 1000");
    }

    const response = await api.get<LogsResponse>(
      `/system/logs/${encodeURIComponent(service)}`,
      {
        params: { lines },
      }
    );
    return response.data;
  },

  async renewCertificate(): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>("/system/certificate/renew");
    return response.data;
  },

  // ================================
  // VMESS MANAGEMENT (AUTHENTICATED)
  // ================================

  async getVMessUsers(configFile?: string): Promise<VMessUsersResponse> {
    const params: Record<string, string> = {};
    if (configFile) {
      params.config_file = configFile;
    }

    const response = await api.get<VMessUsersResponse>("/vmess/users", {
      params,
    });
    return response.data;
  },

  async getVMessUserConfig(
    email: string,
    format: "subscription" | "decoded" | "v2ray" = "v2ray",
    sni?: string
  ): Promise<VMessConfigResponse> {
    if (!email) {
      throw new Error("Email is required");
    }

    const params: Record<string, string> = { format };
    if (sni) {
      params.sni = sni;
    }

    const response = await api.get<VMessConfigResponse>(
      `/vmess/users/${encodeURIComponent(email)}`,
      { params }
    );
    return response.data;
  },

  async generateCustomVMessConfig(
    email: string,
    request: CustomVMessRequest
  ): Promise<CustomVMessResponse> {
    if (!email) {
      throw new Error("Email is required");
    }

    if (!request.sni) {
      throw new Error("SNI is required for custom config generation");
    }

    const response = await api.post<CustomVMessResponse>(
      `/vmess/users/${encodeURIComponent(email)}/generate`,
      request
    );
    return response.data;
  },

  async getPopularSNI(): Promise<PopularSNIResponse> {
    const response = await api.get<PopularSNIResponse>("/vmess/popular-sni");
    return response.data;
  },

  // ================================
  // CONFIGURATION MANAGEMENT (AUTHENTICATED)
  // ================================

  async getConfigFiles(): Promise<ConfigFilesResponse> {
    const response = await api.get<ConfigFilesResponse>("/config/files");
    return response.data;
  },

  // ================================
  // UTILITY METHODS
  // ================================

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.health();
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  },

  // Validate token by trying to get current user
  async validateToken(): Promise<boolean> {
    if (!authToken) return false;

    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  },

  // Get API status information
  async getApiStatus(): Promise<{
    connected: boolean;
    authenticated: boolean;
    version?: string;
    timestamp?: string;
  }> {
    const status = {
      connected: false,
      authenticated: false,
      version: undefined as string | undefined,
      timestamp: undefined as string | undefined,
    };

    try {
      // Test basic connectivity
      const health = await this.health();
      status.connected = true;
      status.version = health.version;
      status.timestamp = health.timestamp;

      // Test authentication if token exists
      if (authToken) {
        status.authenticated = await this.validateToken();
      }
    } catch (error) {
      console.error("Failed to get API status:", error);
    }

    return status;
  },
};

// Global event listeners for auth events
window.addEventListener("auth-expired", (event) => {
  console.warn("🔒 Authentication expired:", event);
  // You can add additional logic here like showing notifications
});

window.addEventListener("access-denied", (event) => {
  console.warn("🚫 Access denied:", event);
  // You can add additional logic here like redirecting to appropriate page
});

window.addEventListener("server-error", (event) => {
  console.error("🔥 Server error:", event);
  // You can add additional logic here like showing error notifications
});

export default api;
