import { useCallback, useEffect } from "react";
import { useGetAgents } from "../api/agent/useGetAgents";
import { useAgent, useAgentActions } from "../store/agentStore";
import { Outlet } from "react-router-dom";
import Spinner from "../components/Spinner";
import {
  getRecentlySelectedAgents,
  initializeRecentlySelectedAgents,
} from "./chat/sidebar/manageRecentlySelectedAgents";
import Sidebar from "./chat/sidebar/Sidebar";

const AgentLayout = () => {
  const { agents } = useAgent();
  const { setAgents, setSelectedAgent } = useAgentActions();

  const { data: availableAgents, isPending: isAgentsLoading } = useGetAgents({
    page: 1,
    records_per_page: 100,
  });

  const handleSetAgents = useCallback(async () => {
    if (availableAgents && availableAgents.total > 0) {
      setAgents(availableAgents?.items);
      setSelectedAgent(availableAgents?.items?.[0]);

      const recentlySelectedAgents = await getRecentlySelectedAgents();

      if (recentlySelectedAgents.length <= 4) {
        initializeRecentlySelectedAgents(availableAgents.items);
      }
    }
  }, [availableAgents, setAgents, setSelectedAgent]);

  useEffect(() => {
    handleSetAgents();
  }, [handleSetAgents]);

  if (isAgentsLoading)
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center">
        <Spinner className="size-4 dark:text-white/60" />
      </div>
    );

  if (!isAgentsLoading && agents && agents.length > 0)
    return (
      <div className="flex h-dvh w-full overflow-hidden">
        <Sidebar /> <Outlet />
      </div>
    );
};

export default AgentLayout;
