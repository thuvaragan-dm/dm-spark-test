export interface Agent {
  id: string;
  shard_id: string;
  name: string;
  path: string;
  prompt: string;
  description: string;
  email_addr_status: "NOT_REQUESTED" | "REQUESTED" | "PROVISIONED";
  email_addr: string | null;
  phone_number_status: "NOT_REQUESTED" | "REQUESTED";
  phone_number: string | null;
  limit_to_context: boolean;
  block_nsfw: boolean;
  tone: "professional" | "PROFESSIONAL" | "Friendly";
  is_active: boolean;
  public: boolean;
  hub_theme: string;
  avatar: string;
  metadata_fields: {
    default_questions?: {
      question: string;
    }[];
  } | null;
}

export type AgentParams = {
  search?: string;
  page?: number;
  records_per_page?: number;
};
