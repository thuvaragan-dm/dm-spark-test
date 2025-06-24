import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { MCPConnectionDetail, UpdateMCPConnectionInput } from "./types";

export const useUpdateMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    UpdateMCPConnectionInput,
    MCPConnectionDetail,
    MCPConnectionDetail
  >({
    apiClient,
    method: "patch",
    url: "/mcp-connections/${id}",
    errorMessage: "Failed to update mcp connection.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (mcpDetails, variables) => {
      if (!mcpDetails) return;
      return { ...mcpDetails, ...variables };
    },
  });
};
