export enum EWorkerAgent {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
}

export const workerAgentKey: Record<EWorkerAgent, string> = {
  [EWorkerAgent.FETCH_ALL]: "get-all-worker-agents",
  [EWorkerAgent.FETCH_SINGLE]: "get-single-worker-agent",
};
