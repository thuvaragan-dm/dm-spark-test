export type AuthMethod = "OAUTH2" | "API_TOKEN" | "BASIC_AUTH" | "CUSTOM";

export interface OAuth2Credentials {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
}

export interface ApiTokenCredentials {
  api_token: string;
  service_base_url?: string | null;
  service_email?: string | null;
}

export interface BasicAuthCredentials {
  username?: string;
  password?: string;
}

export interface CustomCredentials {
  [key: string]: any;
}

// Configuration types that match the provided data structure
export interface OAuth2Config {
  OAuth2Config: OAuth2Credentials;
}

export interface APITokenConfig {
  APITokenConfig: ApiTokenCredentials;
}

export interface BasicAuthConfig {
  BasicAuthConfig: BasicAuthCredentials;
}

export interface CustomConfig {
  CustomConfig: CustomCredentials;
}

// A union type for the different credential configuration objects
export type CredentialConfig =
  | OAuth2Config
  | APITokenConfig
  | BasicAuthConfig
  | CustomConfig;

// Updated interface for the main service provider configuration object
export interface AvailableMCPServer {
  name: string;
  description: string;
  service_provider: string;
  category: string;
}
export interface ConnectedMCPServer {
  id: string;
  name: string;
  description: string;
  category: string;
  service_provider: string;
  user_id: string;
  workspace_id: string;
  auth_method: string;
  is_active: boolean;
  is_workspace_shared: boolean;
}

// Interface for a single tool provided by a service
export interface MCPTool {
  tool_name: string;
  description: string;
}

export interface MCPTemplateDetailParams {
  service_provider_name: string;
}
export interface MCPConnectionDetailParams {
  connection_id: string;
}
export interface MCPTemplateDetail {
  service_provider: string;
  name: string;
  description: string;
  category: string;
  overview: string;
  auth_method: AuthMethod[];
  credentials: CredentialConfig[];
}
export interface MCPConnectionDetail {
  id: string;
  service_provider: string;
  name: string;
  description: string;
  category: string;
  overview: string;
  is_workspace_shared: boolean;
}

export type CreateMCPConnectionParams = {
  service_provider: string;
  auth_method: AuthMethod;
  category?: string;
};

export type MCPToolsParams = {
  service_provider_name: string;
  search?: string;
  records_per_page?: number;
  page?: number;
};

export type AvailableMCPServersParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};

export type ConnectedMCPServersParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};

export type UpdateMCPConnectionInput = {
  service_provider?: string;
  auth_method?: AuthMethod;
  credentials?: Record<string, any>;
  is_workspace_shared?: boolean;
  category?: string;
};
