import { z } from "zod";
import {
  ActualRegisterWorkerAgentSchema,
  ActualUpdateWorkerAgentSchema,
} from "./WorkerAgentSchema";

export enum WorkerAgentOrigin {
  BLUEPRINT = "BLUEPRINT",
  MANAGED = "MANAGED",
  CUSTOM = "CUSTOM",
}
export interface GitHubMetadata {
  published_at: string;
  published_by: string;
  memaid_js_script: string;
  published_commit_hash: string;
  published_repo_user_name: string;
  github_reference_link: string;
}

export interface WorkerAgent {
  id: string;
  name: string;
  description: string;
  overview: string;
  http_endpoint: string | null;
  payload_schema: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  verification_token: string;
  workspace_id: string;
  origin: WorkerAgentOrigin;
  workflow_graph: string | null;
  github_metadata: GitHubMetadata | null;
  agent_avatar_url: string | null;
  category: string | null;
}

export type WorkerAgentInput = z.infer<typeof ActualRegisterWorkerAgentSchema>;
export type UpdateWorkerAgentInput = z.infer<
  typeof ActualUpdateWorkerAgentSchema
>;

export type WorkerAgentParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};

export interface WorkerAgentAvatarInput {
  uploaded_picture: File;
}
