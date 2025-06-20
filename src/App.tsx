import { Navigate, Route, Routes } from "react-router-dom";
import Academy from "./app/academy/Academy";
import Course from "./app/academy/Course";
import BluePrints from "./app/blueprints/BluePrints";
import ChatLayout from "./app/chat/ChatLayout";
import ChatPage from "./app/chat/ChatPage";
import ConfigurationsLayout from "./app/ConfigurationsLayout";
import AllConnectedMCPServers from "./app/mcp/AllConnectedMCPServers";
import MCPDetails from "./app/mcp/MCPDetails";
import McpLayout from "./app/mcp/McpLayout";
import NewMCPServers from "./app/mcp/NewMCPServers";
import RootLayout from "./app/RootLayout";
import ViewWorkerAgents from "./app/workerAgents/ViewWorkerAgents";
import AppChangelog from "./components/AppChangelog";
import AppUpdater from "./components/AppUpdater";
import MCPServersCreatedByYou from "./app/mcp/MCPServersCreatedByYou";
import MCPServersSharedWithYou from "./app/mcp/MCPServersSharedWithYou";
import DeletedMCPServers from "./app/mcp/DeletedMCPServers";

function App() {
  return (
    <>
      {/* AppUpdater component to handle update logic and notifications */}
      {/* It doesn't render any visible UI itself, but listens for events */}
      <AppUpdater />
      <AppChangelog />
      <Routes>
        <Route path="/" element={<ConfigurationsLayout />}>
          <Route path="/" element={<RootLayout />}>
            <Route path="/" element={<Navigate replace to="/home/chat" />} />
            <Route path="/home" element={<ChatLayout />}>
              <Route path="chat" element={<ChatPage />} />
            </Route>
            <Route path="/worker-agents" element={<ViewWorkerAgents />} />

            <Route path="/mcp" element={<McpLayout />}>
              <Route index element={<NewMCPServers />} />
              <Route
                path="details/:service_provider"
                element={<MCPDetails />}
              />
              <Route path="connected" element={<AllConnectedMCPServers />} />
              <Route
                path="created-by-you"
                element={<MCPServersCreatedByYou />}
              />
              <Route
                path="shared-with-you"
                element={<MCPServersSharedWithYou />}
              />
              <Route path="deleted" element={<DeletedMCPServers />} />
            </Route>

            <Route path="/blueprints" element={<BluePrints />} />

            <Route path="/academy">
              <Route index element={<Academy />} />
              <Route path="course/:name" element={<Course />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
