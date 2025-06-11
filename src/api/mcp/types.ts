import { z } from "zod";
import {
  CreateMCPConnectionSchema,
  UpdateMCPConnectionSchema,
} from "./MCPSchema";

export type AuthMethod = "OAUTH2" | "API_TOKEN" | "BASIC_AUTH" | "CUSTOM";

// Interface for OAuth2 credentials
export interface OAuth2Credentials {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
}

// Interface for API Token credentials
export interface ApiTokenCredentials {
  api_token: string;
  service_base_url?: string | null;
  service_email?: string | null;
}

// Interface for Basic Auth credentials
export interface BasicAuthCredentials {
  username?: string;
  password?: string;
}

// Interface for Custom Auth credentials
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
export interface AvailableMCPConnection {
  name: string;
  service_provider: string;
  auth_method: AuthMethod[];
  credentials: CredentialConfig[];
}

export type CreateMCPConnectionInput = z.infer<
  typeof CreateMCPConnectionSchema
>;

export type UpdateMCPConnectionInput = z.infer<
  typeof UpdateMCPConnectionSchema
>;

export type CreateMCPConnectionParams = {
  name: string;
  description: string;
  service_provider: string;
  auth_method: AuthMethod;
};

export interface MCPConnectionResponse {
  id: string;
  user_id: string;
  service_provider: string;
  auth_method: string;
  is_active: boolean;
}

export type AvailableMCPConnectionParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};

export interface ConnectedMCPConnectionItem {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  workspace_id: string;
  service_provider: string;
  auth_method: AuthMethod;
  is_active: boolean;
}

export interface ConnectedMCPGroup {
  name: string;
  connections: ConnectedMCPConnectionItem[];
}

export type ConnectedMCPConnectionsResponse = ConnectedMCPGroup[];
