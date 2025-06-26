import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent, WorkerAgentInput } from "./types";

export const useRegisterWorkerAgent = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    WorkerAgentInput,
    WorkerAgent,
    PaginatedResult<WorkerAgent>
  >({
    apiClient,
    method: "post",
    url: "/worker-agent",
    errorMessage: "Failed to register worker agent.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
