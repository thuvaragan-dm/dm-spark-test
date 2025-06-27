import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Prompt, UpdatePromptInput } from "./types";

export const useUpdatePrompt = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { prompt_id: string },
    UpdatePromptInput,
    Prompt,
    Prompt
  >({
    apiClient,
    method: "patch",
    url: "/prompts/${prompt_id}",
    errorMessage: "Failed to update prompt.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
