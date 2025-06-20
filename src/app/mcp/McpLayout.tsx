import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";

const McpLayout = () => {
  return (
    <div className="flex w-full flex-1 overflow-hidden bg-transparent">
      <Sidebar /> <Outlet />
    </div>
  );
};

export default McpLayout;
