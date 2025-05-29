import { z } from "zod";
import { CreateWorkerAgentSchema } from "./WorkerAgentSchema";

export interface WorkerAgent {
  id: string;
  name: string;
  description: string;
  http_endpoint: string;
  payload_schema: string;
  created_at: string;
  verification_token: string;
}

export type WorkerAgentInput = z.infer<typeof CreateWorkerAgentSchema>;

export type WorkerAgentParams = {
  search?: string;
  records_per_page?: number;
  page?: number;
};
