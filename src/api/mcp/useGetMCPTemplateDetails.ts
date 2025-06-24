import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EMCP, mcpKey } from "./config";
import { MCPTemplateDetail, MCPTemplateDetailParams } from "./types";

export const useGetMCPTemplateDetails = (params?: MCPTemplateDetailParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<MCPTemplateDetail>({
    queryKey: mcpKey[EMCP.FETCH_MCP_TEMPLATE_DETAIL],
    apiClient,
    url: "/mcp-templates/service-provider-details",
    queryParams: params,
  });
};
