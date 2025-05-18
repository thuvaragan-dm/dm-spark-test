import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { agentKey, EAgent } from "./config";
import { Agent, AgentParams } from "./types";

export const useGetAgents = (params: AgentParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Agent>>({
    queryKey: agentKey[EAgent.FETCH_ALL],
    apiClient,
    url: `/copilots/`,
    errorMessage: "", //Set this to empty as it triggers errors then queries gets cancelled.
    queryParams: params,
  });
};
