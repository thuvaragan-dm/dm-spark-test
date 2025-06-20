import { useEffect } from "react";
import { useGetAgents } from "../../api/agent/useGetAgents";
import Spinner from "../../components/Spinner";
import { useAgent, useAgentActions } from "../../store/agentStore";
import ChatArea from "./chatarea/ChatArea";
import { GlobalStreamCompletionHandler } from "./GlobalStreamCompletionHandler";

const ChatPage = () => {
  const { data: agents, isPending: isAgentsLoading } = useGetAgents({
    search: "Spark",
  });

  const { selectedAgent } = useAgent();
  const { setSelectedAgent } = useAgentActions();

  useEffect(() => {
    if (agents && agents.items.length > 0) {
      setSelectedAgent(agents.items[0]);
    }
  }, [agents, setSelectedAgent]);

  return (
    <section className="dark:bg-primary-dark-foreground flex w-full flex-1 flex-col overflow-hidden bg-gray-100">
      {isAgentsLoading && (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Spinner className="size-5 dark:text-white" />
        </div>
      )}

      {!isAgentsLoading && selectedAgent && (
        <>
          <GlobalStreamCompletionHandler />
          <ChatArea />
        </>
      )}
    </section>
  );
};

export default ChatPage;
