import { useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useGetAgents } from "../api/agent/useGetAgents";
import Spinner from "../components/Spinner";
import { useAgent, useAgentActions } from "../store/agentStore";
import {
  getRecentlySelectedAgents,
  initializeRecentlySelectedAgents,
} from "./chat/sidebar/manageRecentlySelectedAgents";
import Sidebar from "./chat/sidebar/Sidebar";
import { LuUnplug } from "react-icons/lu";

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

  if (!isAgentsLoading && agents && agents.length <= 0)
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center">
        <div className="flex w-min shrink-0 items-center justify-center rounded-full bg-amber-100 p-5 text-amber-800 dark:bg-amber-100/10 dark:text-amber-100">
          <LuUnplug className="size-7" />
        </div>
        <p className="mt-2 text-sm font-semibold whitespace-nowrap text-gray-800 dark:text-white">
          No Agents configured
        </p>
        <p className="text-center text-xs text-balance whitespace-nowrap text-gray-600 dark:text-white/60">
          Please contact your administrator for more information
        </p>
      </div>
    );

  if (!isAgentsLoading && agents && agents.length > 0)
    return (
      <div className="flex h-dvh w-full overflow-hidden bg-transparent">
        <Sidebar /> <Outlet />
      </div>
    );
};

export default AgentLayout;
