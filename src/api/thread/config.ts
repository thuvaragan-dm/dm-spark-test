import { useAgent } from "../../store/agentStore";
import { useSidebar } from "../../store/sidebarStore";

export const THREAD_LIMIT = 50;

export enum EThread {
  ALL = 1,
  CONVERSATION = 2,
  TASK = 3,
}

export const threadKey: Record<EThread, string> = {
  [EThread.ALL]: "get-all-threads",
  [EThread.CONVERSATION]: "get-conversation-threads",
  [EThread.TASK]: "get-task-threads",
};

export const useGetThreadKey = () => {
  const { activeThreadFilter } = useSidebar();
  const { selectedAgent } = useAgent();
  const queryParams: {
    limit: number;
    has_task?: boolean;
    copilot_id?: string;
  } = {
    limit: THREAD_LIMIT,
    copilot_id: selectedAgent ? selectedAgent.id : undefined,
  };

  if (activeThreadFilter === 1) {
    delete queryParams.has_task;
  }

  if (activeThreadFilter === 2) {
    queryParams.has_task = false;
  }

  if (activeThreadFilter === 3) {
    queryParams.has_task = true;
  }

  return [threadKey[activeThreadFilter], queryParams];
};
