import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { ConnectedMCPServer } from "./types";

export const useDeleteMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string; service_provider: string },
    unknown,
    ConnectedMCPServer,
    PaginatedResult<ConnectedMCPServer>
  >({
    apiClient,
    method: "delete",
    url: "/mcp-connections/${id}",
    errorMessage: "Failed to delete mcp connection.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldData, _newData, params) => {
      if (!params || !oldData) return oldData;

      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.filter(
            (mcpConnection) =>
              mcpConnection.service_provider !== params.service_provider,
          ),
        };
      }
    },
  });
};
