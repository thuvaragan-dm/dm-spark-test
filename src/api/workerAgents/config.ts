export enum EWorkerAgent {
  FETCH_ALL = 1,
  FETCH_SINGLE = 2,
  FETCH_CATEGORIES = 3,
  FETCH_SHARED_WITH_YOU = 4,
  FETCH_CREATED_BY_YOU = 5,
  FETCH_SECRETS = 6,
}

export const workerAgentKey: Record<EWorkerAgent, string> = {
  [EWorkerAgent.FETCH_ALL]: "get-all-worker-agents",
  [EWorkerAgent.FETCH_CREATED_BY_YOU]: "get-all-created-by-you-worker-agents",
  [EWorkerAgent.FETCH_SHARED_WITH_YOU]: "get-all-shared-with-you-worker-agents",
  [EWorkerAgent.FETCH_SINGLE]: "get-single-worker-agent",
  [EWorkerAgent.FETCH_CATEGORIES]: "get-worker-agent-categories",
  [EWorkerAgent.FETCH_SECRETS]: "get-worker-agent-secrets",
};
