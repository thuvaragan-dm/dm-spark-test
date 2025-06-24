import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { CreateMCPConnectionParams, MCPConnectionDetail } from "./types";

export const useCreateMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    CreateMCPConnectionParams,
    Record<string, any>,
    MCPConnectionDetail,
    unknown
  >({
    apiClient,
    method: "post",
    url: "/mcp-connections?&service_provider=${service_provider}&auth_method=${auth_method}&category=${category}",
    errorMessage: "Failed to create mcp connection.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
