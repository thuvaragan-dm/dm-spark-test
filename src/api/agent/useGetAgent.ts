import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { agentKey, EAgent } from "./config";
import { Agent } from "./types";

export const useGetAgent = (id: string) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Agent>>({
    queryKey: agentKey[EAgent.GET_AGENT],
    apiClient,
    url: `/copilots/${id}`,
    errorMessage: "Failed to fetch agent.",
    queryOptions: {
      enabled: !!id,
    },
  });
};
