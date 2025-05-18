import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./global.css";
import ThemeProvider from "./providers/ThemeProvider.tsx";
import { ApiProvider } from "./providers/ApiProvider.tsx";
import { ReactQueryClientProvider } from "./providers/ReactQueryClientProvider.tsx";
import AlertProvider from "./providers/AlertProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ReactQueryClientProvider>
        <ApiProvider>
          <AlertProvider />
          <App />
        </ApiProvider>
      </ReactQueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
