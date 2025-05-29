import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent, WorkerAgentInput } from "./types";

export const useCreateWorkerAgent = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    WorkerAgentInput,
    WorkerAgent,
    WorkerAgent[]
  >({
    apiClient,
    method: "post",
    url: "/worker-agent",
    errorMessage: "Failed to create worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
