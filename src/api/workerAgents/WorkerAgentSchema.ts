import { z } from "zod";
import { WorkerAgentOrigin } from "./types";

export const RegisterWorkerAgentSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .min(1, "Name is required."),
  description: z
    .string({ required_error: "Description is required." })
    .min(1, "Description is required."),
  overview: z
    .string({ required_error: "Overview is required." })
    .min(1, "Overview is required."),
  category: z
    .string({ required_error: "Category is required." })
    .min(1, "Category is required."),
  origin: z.nativeEnum(WorkerAgentOrigin, {
    required_error: "Origin is required.",
  }),
  http_endpoint: z
    .string({ required_error: "Invalid URL format for http endpoint." })
    .url({ message: "Invalid URL format for http endpoint." }),

  agent_secrets: z
    .array(
      z.object({
        key: z
          .string({ required_error: "Secret key is required." })

          // 1. First, check if the key is empty.
          .min(1, { message: "Secret key cannot be empty." })

          // 2. If not empty, then check if it contains spaces.
          .regex(/^[\S]*$/, { message: "Secret key cannot contain spaces." })

          // 3. Finally, transform it after all validations pass.
          .transform((val) => val.toUpperCase()),

        value: z
          .string({ required_error: "Secret value is required." })
          .min(1, "Secret value cannot be empty."),
      }),
    )
    .optional(),

  payload_schema: z
    .string({ message: "Payload schema must be a string." })
    .optional(),

  github_reference_link: z
    .string({ message: "Github reference link must be a string." })
    .optional(),
});

export const ActualRegisterWorkerAgentSchema = RegisterWorkerAgentSchema.extend(
  {
    agent_secrets: z.record(z.string(), z.any()).optional(),
  },
);

export const UpdateWorkerAgentSchema = RegisterWorkerAgentSchema.partial().omit(
  {},
);

export const ActualUpdateWorkerAgentSchema =
  ActualRegisterWorkerAgentSchema.partial().omit({});
