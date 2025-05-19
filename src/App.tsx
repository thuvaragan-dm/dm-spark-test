import { Route, Routes } from "react-router-dom";
import RootLayout from "./app/RootLayout";
import ChatPage from "./app/chat/ChatPage";
import AgentLayout from "./app/AgentLayout";
import MainPage from "./app/MainPage";
import Explore from "./app/explore/Explore";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route element={<AgentLayout />}>
          <Route path="/" index element={<MainPage />} />
          <Route path="chat/:agentPath" element={<ChatPage />} />
        </Route>
        <Route path="/explore" element={<Explore />} />
      </Route>
    </Routes>
  );
}

export default App;
