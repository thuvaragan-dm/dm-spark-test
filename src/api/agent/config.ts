export enum EAgent {
  FETCH_ALL = 1,
  GET_AGENT = 2,
}

export const agentKey: Record<EAgent, string> = {
  [EAgent.GET_AGENT]: "get-agent",
  [EAgent.FETCH_ALL]: "get-agents",
};
