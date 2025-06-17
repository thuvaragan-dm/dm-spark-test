import { Route, Routes } from "react-router-dom";
import AgentLayout from "./app/AgentLayout";
import MainPage from "./app/MainPage";
import RootLayout from "./app/RootLayout";
import ChatPage from "./app/chat/ChatPage";
import Explore from "./app/explore/Explore";
import AppUpdater from "./components/AppUpdater";
import ViewWorkerAgents from "./app/workerAgents/ViewWorkerAgents";
import McpConnections from "./app/mcp/McpConnections";
import ConfigurationsLayout from "./app/ConfigurationsLayout";
import AppChangelog from "./components/AppChangelog";

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
            <Route element={<AgentLayout />}>
              <Route path="/" index element={<MainPage />} />
              <Route path="chat/:agentPath" element={<ChatPage />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/worker-agents" element={<ViewWorkerAgents />} />
              <Route path="/mcp" element={<McpConnections />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
