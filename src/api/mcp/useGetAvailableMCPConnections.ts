import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { AvailableMCPConnection, AvailableMCPConnectionParams } from "./types";

export const useGetAvailableMCPConnections = (
  params?: AvailableMCPConnectionParams,
) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<AvailableMCPConnection>>({
    queryKey: mcpKey[EMCP.FETCH_AVAILABLE],
    apiClient,
    url: "/mcp-templates",
    queryParams: params,
  });
};
