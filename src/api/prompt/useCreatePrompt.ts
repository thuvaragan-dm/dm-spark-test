import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { CreatePromptInput, Prompt } from "./types";

export const useCreatePrompt = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    CreatePromptInput,
    Prompt,
    PaginatedResult<Prompt>
  >({
    apiClient,
    method: "post",
    url: "/prompts",
    errorMessage: "Failed to create prompt.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
