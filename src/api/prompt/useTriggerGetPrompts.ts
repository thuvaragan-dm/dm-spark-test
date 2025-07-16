import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { Prompt } from "./types";

export const useTriggerGetPrompts = () => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, any>,
    unknown,
    PaginatedResult<Prompt>,
    PaginatedResult<Prompt>
  >({
    apiClient,
    method: "get",
    url: "/prompts",
    errorMessage: "Failed to fetch prompts.",
    mutationOptions: {},
  });
};
