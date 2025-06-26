import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent } from "./types";

export const usePublishWorkerAgent = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { worker_agent_id: string },
    unknown,
    WorkerAgent,
    WorkerAgent
  >({
    apiClient,
    method: "post",
    url: "/worker-agent/${worker_agent_id}/publish",
    errorMessage: "Failed to publish worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
