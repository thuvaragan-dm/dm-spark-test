import { Navigate, Route, Routes } from "react-router-dom";
import AllBlueprints from "./app/blueprint/AllBlueprints";
import BlueprintDetail from "./app/blueprint/BlueprintDetail";
import Bootcamp from "./app/bootcamp/Bootcamp";
import Course from "./app/bootcamp/Course";
import ChatLayout from "./app/chat/ChatLayout";
import ChatPage from "./app/chat/ChatPage";
import ConfigurationsLayout from "./app/ConfigurationsLayout";
import AllConnectedMCPServers from "./app/mcp/AllConnectedMCPServers";
import AvailableMCPServers from "./app/mcp/AvailableMCPServers";
import MCPConnectionDetails from "./app/mcp/MCPConnectionDetails";
import McpLayout from "./app/mcp/McpLayout";
import MCPPage from "./app/mcp/MCPPage";
import MCPServersCreatedByYou from "./app/mcp/MCPServersCreatedByYou";
import MCPServersSharedWithYou from "./app/mcp/MCPServersSharedWithYou";
import MCPTemplateDetails from "./app/mcp/MCPTemplateDetails";
import Memory from "./app/memory/Memory";
import AllPrompts from "./app/prompt/AllPrompts";
import CreatedByYouPrompts from "./app/prompt/CreatedByYouPrompts";
import PromptDetail from "./app/prompt/PromptDetail";
import PromptLayout from "./app/prompt/PromptLayout";
import SharedWithYouPrompts from "./app/prompt/SharedWithYouPrompts";
import RootLayout from "./app/RootLayout";
import AllWorkerAgents from "./app/workerAgent/AllWorkerAgents";
import CreatedByYouWorkerAgents from "./app/workerAgent/CreatedByYouWorkerAgents";
import SharedWithYouWorkerAgents from "./app/workerAgent/SharedWithYouWorkerAgents";
import WorkerAgentDetail from "./app/workerAgent/WorkerAgentDetail";
import WorkerAgentLayout from "./app/workerAgent/WorkerAgentLayout";
import AppChangelog from "./components/AppChangelog";
import AppUpdater from "./components/AppUpdater";

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

            <Route path="/memory" element={<Memory />} />

            <Route path="/worker-agents" element={<WorkerAgentLayout />}>
              <Route index element={<Navigate to={"all"} />} />
              <Route path="all" element={<AllWorkerAgents />} />
              <Route
                path="shared-with-you"
                element={<SharedWithYouWorkerAgents />}
              />
              <Route
                path="created-by-you"
                element={<CreatedByYouWorkerAgents />}
              />
              <Route path="details/:id" element={<WorkerAgentDetail />} />
            </Route>

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

            <Route path="/blueprints">
              <Route index element={<AllBlueprints />} />
              <Route path="details/:id" element={<BlueprintDetail />} />
            </Route>

            <Route path="/bootcamp">
              <Route index element={<Bootcamp />} />
              <Route path="course/:name" element={<Course />} />
            </Route>

            <Route path="/prompts" element={<PromptLayout />}>
              <Route index element={<Navigate replace to="/prompts/all" />} />
              <Route path="all" element={<AllPrompts />} />
              <Route
                path="shared-with-you"
                element={<SharedWithYouPrompts />}
              />
              <Route path="created-by-you" element={<CreatedByYouPrompts />} />
              <Route path="details/:id" element={<PromptDetail />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
