import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

const ChatLayout = () => {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-transparent">
      <Sidebar /> <Outlet />
    </div>
  );
};

export default ChatLayout;
