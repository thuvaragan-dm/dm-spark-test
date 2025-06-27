import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EPrompt, promptKey } from "./config";
import { Prompt, PromptParams } from "./types";

export const useGetSharedWithYouPrompts = (params?: PromptParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Prompt>>({
    queryKey: promptKey[EPrompt.FETCH_SHARED_WITH_YOU],
    apiClient,
    url: "/prompts/shared-with-you",
    errorMessage: "Failed to fetch prompts.",
    queryParams: params,
  });
};
