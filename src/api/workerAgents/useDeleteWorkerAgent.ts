import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent, WorkerAgentInput } from "./types";

export const useDeleteWorkerAgent = ({
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
    method: "delete",
    url: "/worker-agent/${id}",
    errorMessage: "Failed to delete worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldData, _newData, params) => {
      if (!params || !oldData) return oldData;

      console.log(oldData);

      return {
        ...oldData,
        items: oldData.items.filter((agent) => agent.id !== params.id),
        total: oldData.total - 1,
      };
    },
  });
};
