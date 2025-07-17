import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./global.css";
import AlertProvider from "./providers/AlertProvider.tsx";
import { ApiProvider } from "./providers/ApiProvider.tsx";
import { ReactQueryClientProvider } from "./providers/ReactQueryClientProvider.tsx";
import ThemeProvider from "./providers/ThemeProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <ReactQueryClientProvider>
          <ApiProvider>
            <AlertProvider />
            <div
              id="tooltip-container"
              className="relative isolate z-[999999999]"
            ></div>
            <div
              id="select-container"
              className="relative isolate z-[999999999]"
            ></div>
            <div
              id="menu-container"
              className="relative isolate z-[99999999999]"
            ></div>
            <div
              id="modal-container"
              className="relative isolate z-[99999999999]"
            ></div>
            <div
              id="drawer-container"
              className="relative isolate z-[999999999]"
            ></div>
            <App />
          </ApiProvider>
        </ReactQueryClientProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
);
