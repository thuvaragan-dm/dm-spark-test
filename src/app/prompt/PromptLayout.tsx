import { Outlet } from "react-router-dom";
import CreatePromptDrawer from "./CreatePromptDrawer";
import Sidebar from "./sidebar/Sidebar";
import UpdatePromptDrawer from "./UpdatePromptDrawer";

const PromptLayout = () => {
  return (
    <div className="flex w-full flex-1 overflow-hidden bg-transparent">
      <Sidebar /> <Outlet /> <CreatePromptDrawer /> <UpdatePromptDrawer />
    </div>
  );
};

export default PromptLayout;
