import { z } from "zod";

export const CreatePromptSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty." }),
  prompt: z.string().min(1, { message: "Prompt cannot be empty." }),
  is_workspace_shared: z.boolean().default(false).optional(),
  category: z.string().min(1, { message: "Category cannot be empty." }),
});

export const UpdatePromptSchema = CreatePromptSchema.partial().omit({});
