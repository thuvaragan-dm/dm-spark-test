import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EWorkerAgent, workerAgentKey } from "./config";
import { WorkerAgent, WorkerAgentParams } from "./types";

export const useGetCreatedByYouWorkerAgents = (params?: WorkerAgentParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<WorkerAgent>>({
    queryKey: workerAgentKey[EWorkerAgent.FETCH_CREATED_BY_YOU],
    apiClient,
    url: `/worker-agent/created-by-you`,
    queryParams: params,
  });
};
