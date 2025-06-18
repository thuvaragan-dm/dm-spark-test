import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAgent } from "../store/agentStore";
import {
  getRecentlySelectedAgents,
  StoredAgent,
} from "./chat/sidebar/manageRecentlySelectedAgents";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { agents } = useAgent();

  // State for recently selected agents and loading status
  const [recentlySelected, setRecentlySelected] = useState<StoredAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true); // True until we decide to redirect or show fallback UI
  const [hasFetchedRecentAgents, setHasFetchedRecentAgents] = useState(false);

  // Effect 1: Fetch recently selected agents when the component mounts
  useEffect(() => {
    const fetchRecentAgents = async () => {
      try {
        console.log("MainPage: Fetching recently selected agents...");
        const recentAgentsData = await getRecentlySelectedAgents();
        setRecentlySelected(recentAgentsData);
        console.log(
          "MainPage: Recently selected agents fetched:",
          recentAgentsData,
        );
      } catch (error) {
        console.error(
          "MainPage: Error fetching recently selected agents:",
          error,
        );
        setRecentlySelected([]);
      } finally {
        setHasFetchedRecentAgents(true);
      }
    };

    fetchRecentAgents();
  }, []);

  // Effect 2: Perform redirection once all necessary data is available
  useEffect(() => {
    // Wait until recent agents have been fetched AND agents from the global store are available
    if (!hasFetchedRecentAgents || !agents) {
      console.log(
        "MainPage: Waiting for agent data (either recent agents fetch is not complete or global agents are not loaded).",
      );
      // Still loading, so keep isLoading true (or ensure it's not prematurely set to false)
      // setIsLoading(true); // This line is not strictly needed if isLoading starts true and is only set false below
      return;
    }

    console.log(
      "MainPage: Determining target agent path. Recent:",
      recentlySelected,
      "All Agents:",
      agents,
    );
    let targetAgentPath: string | undefined;

    if (recentlySelected.length > 0 && recentlySelected[0]?.path) {
      targetAgentPath = recentlySelected[0].path;
    } else if (agents.length > 0 && agents[0]?.path) {
      // Fallback to the first agent from the general list if no recent ones
      targetAgentPath = agents[0].path;
    }

    if (targetAgentPath) {
      console.log(`MainPage: Redirecting to /chat/${targetAgentPath}`);
      // No need to setIsLoading(false) here, as the component will unmount upon navigation.
      // The spinner will show until navigation occurs.
      navigate(`/home/chat/${targetAgentPath}`, { replace: true });
    } else {
      // All data has been processed, but no agent path was found for redirection.
      // Stop loading and allow fallback UI to render.
      console.warn(
        "MainPage: No agent path found for redirection. Fallback UI will be shown.",
      );
      setIsLoading(false);
    }
  }, [navigate, agents, recentlySelected, hasFetchedRecentAgents]);

  // Render loading spinner while isLoading is true
  if (isLoading) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center">
        <Spinner className="size-4 dark:text-white/60" />
      </div>
    );
  }

  // If not loading (isLoading is false), it means no redirect happened.
  // This implies hasFetchedRecentAgents is true, agents are loaded (or an empty array),
  // but no targetAgentPath was found. Show a fallback message.
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
        No Agent Available
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Could not determine an agent to display. Please check your configuration
        or try selecting an agent manually.
      </p>
      {/* Optionally, you could add a button here to navigate to an agent selection page or dashboard */}
      {/* <button onClick={() => navigate('/select-agent')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Select Agent</button> */}
    </div>
  );
};

export default MainPage;
