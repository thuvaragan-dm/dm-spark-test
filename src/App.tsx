import { Route, Routes } from "react-router-dom";
import Academy from "./app/academy/Academy";
import AgentLayout from "./app/AgentLayout";
import BluePrints from "./app/blueprints/BluePrints";
import ChatPage from "./app/chat/ChatPage";
import ConfigurationsLayout from "./app/ConfigurationsLayout";
import Explore from "./app/explore/Explore";
import MainPage from "./app/MainPage";
import McpConnections from "./app/mcp/McpConnections";
import RootLayout from "./app/RootLayout";
import ViewWorkerAgents from "./app/workerAgents/ViewWorkerAgents";
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
            <Route path="/" element={<AgentLayout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/home">
                <Route path="chat/:agentPath" element={<ChatPage />} />
                <Route path="explore" element={<Explore />} />
              </Route>
            </Route>
            <Route path="/worker-agents" element={<ViewWorkerAgents />} />
            <Route path="/mcp" element={<McpConnections />} />
            <Route path="/blueprints" element={<BluePrints />} />
            <Route path="/academy" element={<Academy />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
