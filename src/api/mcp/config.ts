export enum EMCP {
  FETCH_CONNECTED = 1,
  FETCH_ALL_CONNECTED = 2,
  FETCH_SHARED_WITH_YOU = 3,
  FETCH_CREATED_BY_YOU = 4,
  FETCH_MCP_TEMPLATE_DETAIL = 5,
  FETCH_MCP_CONNECTION_DETAIL = 6,
  FETCH_MCP_TOOLS = 7,
}

export const mcpKey: Record<EMCP, string> = {
  [EMCP.FETCH_CONNECTED]: "get-all-connected-mcp-servers",
  [EMCP.FETCH_ALL_CONNECTED]: "get-all-available-mcp-servers",
  [EMCP.FETCH_SHARED_WITH_YOU]: "get-all-shared-with-you-mcp-servers",
  [EMCP.FETCH_CREATED_BY_YOU]: "get-all-created-by-you-mcp-servers",
  [EMCP.FETCH_MCP_TEMPLATE_DETAIL]: "get-mcp-template-detail",
  [EMCP.FETCH_MCP_CONNECTION_DETAIL]: "get-mcp-connection-detail",
  [EMCP.FETCH_MCP_TOOLS]: "get-mcp-tools",
};
