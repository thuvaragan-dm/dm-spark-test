import { z } from "zod";

export const CreateMCPConnectionSchema = z.object({
  access_token: z.string().optional(),
  api_token: z.string().optional(),
  service_base_url: z.string().optional(),
  service_email: z.string().optional(),
});

export const UpdateMCPConnectionSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  description: z.string().optional(),
  service_provider: z.string().optional(),
  auth_method: z.string().optional(),
  credentials: z.record(z.unknown()).optional(),
});
