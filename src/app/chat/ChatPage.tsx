import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAgent, useAgentActions } from "../../store/agentStore";
import NewChatArea from "./chatarea/NewChatArea";
import GlobalStreamManager from "./GlobalStreamManager";

const ChatPage = () => {
  const { agents } = useAgent();
  const { setSelectedAgent } = useAgentActions();
  const params = useParams<{ agentPath: string }>();

  const currentlySelectedAgent = useMemo(() => {
    return agents.find((a) => a.path === params.agentPath) || agents[0];
  }, [agents, params]);

  useEffect(() => {
    setSelectedAgent(currentlySelectedAgent);
  }, [currentlySelectedAgent, setSelectedAgent]);

  return (
    <section className="flex w-full flex-1 flex-col overflow-hidden">
      <GlobalStreamManager />
      <NewChatArea />
    </section>
  );
};

export default ChatPage;
