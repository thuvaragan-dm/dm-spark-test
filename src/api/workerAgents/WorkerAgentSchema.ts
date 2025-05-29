import { z } from "zod";

export const CreateWorkerAgentSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(1, "Name is required."),
  description: z
    .string({ required_error: "Description is required." })
    .min(1, "Description is required."),
  http_endpoint: z
    .string({ required_error: "Invalid URL format for http endpoint." })
    .url({ message: "Invalid URL format for http endpoint." }),
  payload_schema: z
    .string({ message: "Payload schema must be a string." })
    .optional(),
});

export const UpdateWorkerAgentSchema = CreateWorkerAgentSchema.partial().omit(
  {},
);
