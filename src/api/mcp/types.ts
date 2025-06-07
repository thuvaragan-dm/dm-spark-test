import { z } from "zod";
import {
  CreateMCPConnectionSchema,
  UpdateMCPConnectionSchema,
} from "./MCPSchema";

export type AuthMethod = "OAUTH2" | "API_TOKEN" | "BASIC_AUTH" | "CUSTOM";

// Interface for OAuth2 credentials
export interface OAuth2Credentials {
  access_token: string;
  refresh_token: string | null;
}

// Interface for API Token credentials
export interface ApiTokenCredentials {
  api_token: string;
  service_base_url: string | null;
  service_email: string | null;
}

// A union type for the different credential structures
export type Credential = OAuth2Credentials | ApiTokenCredentials;

// Interface for the main service provider configuration object
export interface AvailableMCPConnection {
  name: string;
  service_provider: string; // e.g., "GitHubMCP", "JiraMCP", "SlackMCP"
  auth_method: AuthMethod[];
  credentials: Credential[];
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
