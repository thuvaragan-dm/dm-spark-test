import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EWorkerAgent, workerAgentKey } from "./config";

export const useGetWorkerAgentSecrets = (params: {
  worker_agent_id: string;
}) => {
  const { apiClient } = useApi();

  return useCreateQuery<Record<string, any>>({
    queryKey:
      workerAgentKey[EWorkerAgent.FETCH_SECRETS] + params.worker_agent_id,
    apiClient,
    url: `/worker-agent/${params.worker_agent_id}/secrets`,
    queryParams: params,
    queryOptions: {
      enabled: !!params.worker_agent_id,
    },
  });
};
