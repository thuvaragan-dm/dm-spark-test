import { z } from "zod";
import { CreatePromptSchema, UpdatePromptSchema } from "./PromptSchema";

export interface Prompt {
  id: string;
  name: string;
  prompt: string;
  is_workspace_shared: boolean;
  created_by: string;
  workspace_id: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export type PromptParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};

export type CreatePromptInput = z.infer<typeof CreatePromptSchema>;
export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>;
