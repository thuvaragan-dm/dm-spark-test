import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { AvailableMCPServer, AvailableMCPServersParams } from "./types";

export const useGetAvailableMCPServers = (
  params?: AvailableMCPServersParams,
) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<AvailableMCPServer>>({
    queryKey: mcpKey[EMCP.FETCH_ALL_CONNECTED],
    apiClient,
    url: "/mcp-templates",
    queryParams: params,
  });
};
