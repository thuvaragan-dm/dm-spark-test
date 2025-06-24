import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { AvailableMCPServersParams, ConnectedMCPServer } from "./types";

export const useGetSharedWithYouMCPServers = (
  params?: AvailableMCPServersParams,
) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<ConnectedMCPServer>>({
    queryKey: mcpKey[EMCP.FETCH_SHARED_WITH_YOU],
    apiClient,
    url: "/mcp-connections/shared-with-you",
    queryParams: params,
  });
};
