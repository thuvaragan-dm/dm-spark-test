import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import { ConnectedMCPConnectionItem, ConnectedMCPGroup } from "./types";

export const useToggleMCPConnectionStatus = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string; name: string },
    { enable: boolean },
    ConnectedMCPConnectionItem,
    PaginatedResult<ConnectedMCPGroup>
  >({
    apiClient,
    method: "patch",
    url: "/mcp-connections/${id}/toggle-active",
    errorMessage: "Failed to update mcp connection status.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldData, newData, params) => {
      if (!params) return oldData;

      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.map((mcpConnection) => {
            if (mcpConnection.name === params.name) {
              return {
                ...mcpConnection,
                connections: mcpConnection.connections.map((con) => {
                  if (con.id === params.id) {
                    return { ...con, is_active: newData.enable };
                  }
                  return con;
                }),
              };
            }
            return mcpConnection;
          }),
        };
      }
    },
  });
};
