import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { MCPTool, MCPToolsParams } from "./types";

export const useGetMCPTools = (params?: MCPToolsParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<MCPTool>>({
    queryKey: mcpKey[EMCP.FETCH_MCP_TOOLS],
    apiClient,
    url: "/mcp-templates/tools",
    queryParams: params,
    queryOptions: {
      enabled: !!params?.service_provider_name,
    },
  });
};
