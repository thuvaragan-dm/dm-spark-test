import { Route, Routes } from "react-router-dom";
import AgentLayout from "./app/AgentLayout";
import MainPage from "./app/MainPage";
import RootLayout from "./app/RootLayout";
import ChatPage from "./app/chat/ChatPage";
import Explore from "./app/explore/Explore";
import AppUpdater from "./components/AppUpdater";

function App() {
  return (
    <>
      {/* AppUpdater component to handle update logic and notifications */}
      {/* It doesn't render any visible UI itself, but listens for events */}
      <AppUpdater />
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route element={<AgentLayout />}>
            <Route path="/" index element={<MainPage />} />
            <Route path="chat/:agentPath" element={<ChatPage />} />
          </Route>
          <Route path="/explore" element={<Explore />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
