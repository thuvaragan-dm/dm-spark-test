// electron/preload.ts
import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron";

// --- Define IPC Channel Constants (must match main.ts and renderer store) ---
const AGENT_IPC_CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
};

// --- Allowed Channels for Generic Invoke ---
// It's good practice to list all channels that electronAPI.invoke can use.
const ALLOWED_INVOKE_CHANNELS = [
  ...Object.values(AGENT_IPC_CHANNELS),
  // Add other channel names here if your app uses electronAPI.invoke for other features
];

// --- Token Handling Logic (from your existing preload script) ---
let currentToken: string | null = null;

ipcRenderer.on("deep-link-token", (_event: IpcRendererEvent, token: string) => {
  console.log("Preload: Received 'deep-link-token' from main process:", token);
  currentToken = token;
  // Notify renderer, e.g., window.dispatchEvent(new CustomEvent('token-updated', { detail: token }));
});

ipcRenderer.on("auth-token-deleted", () => {
  console.log("Preload: Received 'auth-token-deleted' from main process.");
  currentToken = null;
  // Notify renderer, e.g., window.dispatchEvent(new CustomEvent('token-was-deleted'));
});

// --- Expose APIs to Renderer ---
contextBridge.exposeInMainWorld("electronAPI", {
  // Generic IPC methods (from your existing preload, slightly adapted for safety)
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) {
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },
  off(channel: string, listener: (...args: unknown[]) => void) {
    ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: unknown[]) {
    ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: unknown[]): Promise<any> {
    if (ALLOWED_INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    console.error(
      `Preload: IPC channel '${channel}' is not allowed for invoke.`,
    );
    return Promise.reject(
      new Error(`IPC channel '${channel}' is not allowed for invoke.`),
    );
  },

  // Token specific methods (from your existing preload)
  getToken: (): string | null => {
    return currentToken;
  },
  deleteToken: (): void => {
    console.log(
      "Preload: deleteToken() called. Requesting main process to delete token.",
    );
    ipcRenderer.send("delete-auth-token"); // This 'send' should be fine.
  },
  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    ipcRenderer.on("deep-link-token", listener); // This 'on' is specific and fine.
    return () => {
      ipcRenderer.removeListener("deep-link-token", listener);
    };
  },
  onTokenDeleted: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("auth-token-deleted", listener); // This 'on' is specific and fine.
    return () => {
      ipcRenderer.removeListener("auth-token-deleted", listener);
    };
  },
});

console.log(
  "Preload script loaded. electronAPI exposed with file system agent storage and token logic.",
);
