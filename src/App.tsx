import { Navigate, Route, Routes } from "react-router-dom";
import Bootcamp from "./app/bootcamp/Bootcamp";
import Course from "./app/bootcamp/Course";
import BluePrints from "./app/blueprints/BluePrints";
import ChatLayout from "./app/chat/ChatLayout";
import ChatPage from "./app/chat/ChatPage";
import ConfigurationsLayout from "./app/ConfigurationsLayout";
import AllConnectedMCPServers from "./app/mcp/AllConnectedMCPServers";
import AvailableMCPServers from "./app/mcp/AvailableMCPServers";
import MCPConnectionDetails from "./app/mcp/MCPConnectionDetails";
import McpLayout from "./app/mcp/McpLayout";
import MCPServersCreatedByYou from "./app/mcp/MCPServersCreatedByYou";
import MCPServersSharedWithYou from "./app/mcp/MCPServersSharedWithYou";
import MCPTemplateDetails from "./app/mcp/MCPTemplateDetails";
import RootLayout from "./app/RootLayout";
import ViewWorkerAgents from "./app/workerAgents/ViewWorkerAgents";
import AppChangelog from "./components/AppChangelog";
import AppUpdater from "./components/AppUpdater";
import MCPPage from "./app/mcp/MCPPage";

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
              <Route index element={<MCPPage />} />

              <Route path="templates" element={<AvailableMCPServers />} />
              <Route
                path="details/template/:service_provider"
                element={<MCPTemplateDetails />}
              />

              <Route path="connections" element={<AllConnectedMCPServers />} />
              <Route
                path="details/connection/:connection_id"
                element={<MCPConnectionDetails />}
              />

              <Route
                path="created-by-you"
                element={<MCPServersCreatedByYou />}
              />
              <Route
                path="shared-with-you"
                element={<MCPServersSharedWithYou />}
              />
            </Route>

            <Route path="/blueprints" element={<BluePrints />} />

            <Route path="/bootcamp">
              <Route index element={<Bootcamp />} />
              <Route path="course/:name" element={<Course />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
