import { useLocation, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { useAuthActions } from "../../store/authStore";

const ChatPage = () => {
  const { logout } = useAuthActions();
  const location = useLocation();
  const path = useParams<{ agentPath: string }>();

  return (
    <section className="flex w-full flex-1 flex-col overflow-y-auto">
      <p className="text-gray-800 dark:text-white">{path.agentPath}</p>
      <pre className="text-gray-800 dark:text-white">
        {JSON.stringify(location, null, 2)}
      </pre>
      <Button className={"mt-5"} onClick={logout}>
        Logout
      </Button>
    </section>
  );
};

export default ChatPage;
