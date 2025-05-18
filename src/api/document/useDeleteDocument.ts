import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";

export const useDeleteDocument = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<{ id: string }, unknown, unknown, unknown[]>({
    apiClient,
    method: "delete",
    url: "/documents/${id}",
    errorMessage: "Failed to delete document.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
