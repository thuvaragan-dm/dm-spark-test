import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EPrompt, promptKey } from "./config";
import { Prompt, PromptParams } from "./types";

export const useGetCreatedByYouPrompts = (params?: PromptParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Prompt>>({
    queryKey: promptKey[EPrompt.FETCH_CREATED_BY_YOU],
    apiClient,
    url: "/prompts/created-by-you",
    errorMessage: "Failed to fetch prompts.",
    queryParams: params,
  });
};
