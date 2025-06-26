interface AgentSecretConfig {
  [key: string]: string | undefined;
}

export interface AgentBlueprint {
  id: string;
  name: string;
  description: string;
  overview: string;
  agent_secrets_config: AgentSecretConfig;
  workflow_graph: string;
  agent_avatar_url: string;
  category: string;
  github_reference: string;
  created_at: string;
  updated_at: string;
}

export type BlueprintsParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};
