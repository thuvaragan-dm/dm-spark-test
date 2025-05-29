import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EWorkerAgent, workerAgentKey } from "./config";
import { WorkerAgent, WorkerAgentParams } from "./types";

export const useGetWorkerAgents = (params?: WorkerAgentParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<WorkerAgent>>({
    queryKey: workerAgentKey[EWorkerAgent.FETCH_ALL],
    apiClient,
    url: `/worker-agent`,
    queryParams: params,
  });
};
