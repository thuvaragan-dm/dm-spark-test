import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { ConnectedMCPConnectionItem, ConnectedMCPGroup } from "./types";

export const useDeleteMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string; name: string },
    unknown,
    ConnectedMCPConnectionItem,
    PaginatedResult<ConnectedMCPGroup>
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
          items: oldData.items.map((mcpConnection) => {
            if (mcpConnection.name === params.name) {
              return {
                ...mcpConnection,
                connections: mcpConnection.connections.filter(
                  (con) => con.id !== params.id,
                ),
              };
            }
            return mcpConnection;
          }),
        };
      }
    },
  });
};
