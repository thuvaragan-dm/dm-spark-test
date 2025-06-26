import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EWorkerAgent, workerAgentKey } from "./config";

export const useGetCategories = () => {
  const { apiClient } = useApi();

  return useCreateQuery<string[]>({
    queryKey: workerAgentKey[EWorkerAgent.FETCH_CATEGORIES],
    apiClient,
    url: "/worker-agent/categories",
  });
};
