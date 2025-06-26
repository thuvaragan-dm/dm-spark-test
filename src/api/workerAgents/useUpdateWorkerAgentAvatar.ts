import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { WorkerAgent, WorkerAgentAvatarInput } from "./types";

export const useUpdateWorkerAgentAvatar = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { formDataApiClient } = useApi();

  return useCreateMutation<
    { worker_agent_id: string },
    WorkerAgentAvatarInput,
    WorkerAgent,
    WorkerAgent
  >({
    apiClient: formDataApiClient,
    method: "put",
    url: "/worker-agent/${worker_agent_id}/upload_avatar",
    errorMessage: "Failed to upload worker agent avatar.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
