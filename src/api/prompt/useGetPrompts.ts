import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EPrompt, promptKey } from "./config";
import { Prompt, PromptParams } from "./types";

export const useGetPrompts = (
  params?: PromptParams,
  options?: { enabled?: boolean },
) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Prompt>>({
    queryKey: promptKey[EPrompt.FETCH_ALL],
    apiClient,
    url: "/prompts",
    errorMessage: "Failed to fetch prompts.",
    queryParams: params,
    queryOptions: { enabled: options?.enabled },
  });
};
