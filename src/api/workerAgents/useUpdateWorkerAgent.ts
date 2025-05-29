import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent, WorkerAgentInput } from "./types";

export const useUpdateWorkerAgent = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    WorkerAgentInput,
    WorkerAgent,
    PaginatedResult<WorkerAgent>
  >({
    apiClient,
    method: "patch",
    url: "/worker-agent/${id}",
    errorMessage: "Failed to update worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldData, newData, params) => {
      if (!params) return oldData;

      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.map((agent) => {
            if (agent.id === params.id) {
              return { ...agent, ...newData };
            }
            return agent;
          }),
        };
      }
    },
  });
};
