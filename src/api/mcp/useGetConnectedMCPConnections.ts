import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { AvailableMCPConnectionParams, ConnectedMCPGroup } from "./types";

export const useGetConnectedMCPConnections = (
  params?: AvailableMCPConnectionParams,
) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<ConnectedMCPGroup>>({
    queryKey: mcpKey[EMCP.FETCH_CONNECTED],
    apiClient,
    url: "/mcp-connections",
    queryParams: params,
  });
};
