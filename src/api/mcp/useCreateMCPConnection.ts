import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import {
  AvailableMCPConnection,
  CreateMCPConnectionInput,
  CreateMCPConnectionParams,
  MCPConnectionResponse,
} from "./types";

export const useCreateMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    CreateMCPConnectionParams,
    CreateMCPConnectionInput,
    MCPConnectionResponse,
    PaginatedResult<AvailableMCPConnection>
  >({
    apiClient,
    method: "post",
    url: "/mcp-connections?name=${name}&service_provider=${service_provider}&auth_method=${auth_method}&description=${description}",
    errorMessage: "Failed to create mcp connection.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
