import { Outlet } from "react-router-dom";
import RegisterWorkerAgentModal from "./RegisterWorkerAgent/RegisterWorkerAgentModal";
import Sidebar from "./sidebar/Sidebar";

const WorkerAgentLayout = () => {
  return (
    <div className="flex w-full flex-1 overflow-hidden bg-transparent">
      <Sidebar /> <Outlet /> <RegisterWorkerAgentModal />
    </div>
  );
};

export default WorkerAgentLayout;
