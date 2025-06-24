import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { MCPConnectionDetail, MCPConnectionDetailParams } from "./types";

export const useGetMCPConnectionDetails = (
  params?: MCPConnectionDetailParams,
) => {
  const { apiClient } = useApi();

  return useCreateQuery<MCPConnectionDetail>({
    queryKey: mcpKey[EMCP.FETCH_MCP_CONNECTION_DETAIL] + params?.connection_id,
    apiClient,
    url: `/mcp-connections-details/${params?.connection_id}`,
    queryOptions: {
      enabled: !!params?.connection_id,
    },
  });
};
