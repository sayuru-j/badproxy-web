// System Types
export interface SystemInfo {
  installed_protocols: string[]
  version: string
  config_path: string
  vmess_enabled: boolean
}

export interface ServiceStatus {
  service: string
  status: string
  pid: number | null
  uptime: string | null
}

export interface LogsResponse {
  service: string
  logs: string
  lines: number
}

// VMess Types
export interface VMessUser {
  email: string
  uuid: string
  has_subscription: boolean
  vmess_available: boolean
}

export interface VMessUsersResponse {
  total_vmess_users: number
  users: VMessUser[]
}

export interface VMessConfig {
  port: number
  ps: string
  tls: string
  id: string
  aid: number
  v: number
  host: string
  type: string
  path: string
  net: string
  add: string
  allowInsecure: number
  method: string
  peer: string
  sni: string
}

export interface V2RayOutbound {
  mux: object
  protocol: string
  sendThrough: string
  settings: {
    vnext: Array<{
      address: string
      port: number
      users: Array<{
        id: string
        security: string
        alterId: number
      }>
    }>
  }
  streamSettings: {
    network: string
    security: string
    tlsSettings: {
      allowInsecure: boolean
      disableSystemRoot: boolean
      serverName: string
    }
    wsSettings: {
      headers: {
        Host: string
      }
      path: string
    }
    xtlsSettings: {
      disableSystemRoot: boolean
    }
  }
  tag: string
}

export interface VMessConfigResponse {
  email: string
  format: string
  vmess_link?: string
  vmess_config?: VMessConfig
  v2ray_config?: {
    outbounds: V2RayOutbound[]
  }
  custom_sni?: string
  note: string
}

export interface CustomVMessRequest {
  sni: string
  security?: string
}

export interface CustomVMessResponse {
  email: string
  custom_config: {
    outbounds: V2RayOutbound[]
  }
  settings: {
    custom_sni: string
    original_host: string
    security: string
    allow_insecure: boolean
    server_address: string
    server_port: number
    websocket_path: string
  }
  note: string
}

export interface PopularSNI {
  cloudflare: string[]
  microsoft: string[]
  zoom: string[]
  google: string[]
  amazon: string[]
  akamai: string[]
}

export interface PopularSNIResponse {
  popular_sni_domains: PopularSNI
  note: string
  usage: string
}

// Config Types
export interface ConfigFile {
  filename: string
  size: number
  exists: boolean
  is_vmess: boolean
  client_count: number | null
}

export interface ConfigFilesResponse {
  config_path: string
  total_files: number
  json_files: ConfigFile[]
  vmess_files: string[]
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string
  success?: boolean
  data?: T
}

export interface ApiError {
  detail: string | Array<{
    loc: string[]
    msg: string
    type: string
  }>
  error_code?: string
}

// Health Check
export interface HealthResponse {
  message: string
  status: string
  timestamp: string
  version: string
}