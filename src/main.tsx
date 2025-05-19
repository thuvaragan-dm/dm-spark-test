import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./global.css";
import AlertProvider from "./providers/AlertProvider.tsx";
import { ApiProvider } from "./providers/ApiProvider.tsx";
import { ReactQueryClientProvider } from "./providers/ReactQueryClientProvider.tsx";
import ThemeProvider from "./providers/ThemeProvider.tsx";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <ReactQueryClientProvider>
          <ApiProvider>
            <AlertProvider />
            <App />
          </ApiProvider>
        </ReactQueryClientProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
);
