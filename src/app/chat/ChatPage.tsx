import ChatArea from "./chatarea/ChatArea";
import { GlobalStreamCompletionHandler } from "./GlobalStreamCompletionHandler";

const ChatPage = () => {
  return (
    <section className="flex w-full flex-1 flex-col overflow-hidden">
      <GlobalStreamCompletionHandler />
      <ChatArea />
    </section>
  );
};

export default ChatPage;
