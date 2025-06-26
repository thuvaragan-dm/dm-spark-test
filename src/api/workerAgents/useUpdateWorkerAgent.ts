import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { UpdateWorkerAgentInput, WorkerAgent } from "./types";

export const useUpdateWorkerAgent = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    UpdateWorkerAgentInput,
    WorkerAgent,
    WorkerAgent
  >({
    apiClient,
    method: "patch",
    url: "/worker-agent/${id}",
    errorMessage: "Failed to update worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldData, newData) => {
      if (!oldData) return oldData;

      if (oldData) {
        return { ...oldData, ...newData } as WorkerAgent;
      }
    },
  });
};
