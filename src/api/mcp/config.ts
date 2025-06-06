export enum EMCP {
  FETCH_CONNECTED = 1,
  FETCH_AVAILABLE = 2,
  FETCH_SINGLE = 3,
}

export const mcpKey: Record<EMCP, string> = {
  [EMCP.FETCH_CONNECTED]: "get-all-connected-mcp-connections",
  [EMCP.FETCH_AVAILABLE]: "get-all-available-mcp-connections",
  [EMCP.FETCH_SINGLE]: "get-single-mcp-connection",
};
