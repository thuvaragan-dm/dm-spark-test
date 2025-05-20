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
const ALLOWED_INVOKE_CHANNELS = [
  ...Object.values(AGENT_IPC_CHANNELS),
  // Add other channel names here if your app uses electronAPI.invoke for other features
];

// --- Allowed Channels for Listening (ipcRenderer.on) ---
const ALLOWED_LISTEN_CHANNELS = [
  "deep-link-token",
  "auth-token-deleted",
  "main-process-message", // From your createWindow
  // Update channels
  "update-available",
  "update-not-available",
  "update-error",
  "update-download-progress",
  "update-downloaded",
];

// --- Allowed Channels for Sending (ipcRenderer.send) ---
const ALLOWED_SEND_CHANNELS = [
  "open-external-url",
  "delete-auth-token",
  // Update channels
  "download-update",
  "quit-and-install-update",
];

// --- Token Handling Logic (from your existing preload script) ---
let currentToken: string | null = null;

ipcRenderer.on("deep-link-token", (_event: IpcRendererEvent, token: string) => {
  console.log("[Preload] Received 'deep-link-token' from main process:", token);
  currentToken = token;
  // Optionally, notify renderer more directly if needed, e.g., via a custom event
  // window.dispatchEvent(new CustomEvent('token-updated', { detail: token }));
});

ipcRenderer.on("auth-token-deleted", () => {
  console.log("[Preload] Received 'auth-token-deleted' from main process.");
  currentToken = null;
  // Optionally, notify renderer more directly
  // window.dispatchEvent(new CustomEvent('token-was-deleted'));
});

// --- Expose APIs to Renderer ---
contextBridge.exposeInMainWorld("electronAPI", {
  // Generic IPC methods
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) {
    if (ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, listener);
      return () => {
        // Return a cleanup function
        ipcRenderer.removeListener(channel, listener);
      };
    }
    console.warn(
      `[Preload] Attempted to listen on disallowed channel '${channel}'`,
    );
    return () => {}; // Return a no-op cleanup for disallowed channels
  },
  off(channel: string, listener: (...args: unknown[]) => void) {
    // It's good practice to also check ALLOWED_LISTEN_CHANNELS here if you want strictness
    // or ensure that 'on' always returns the correct remover.
    ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: unknown[]) {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(
        `[Preload] Attempted to send on disallowed channel '${channel}'`,
      );
    }
  },
  invoke(channel: string, ...args: unknown[]): Promise<any> {
    if (ALLOWED_INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    console.error(
      `[Preload] IPC channel '${channel}' is not allowed for invoke.`,
    );
    return Promise.reject(
      new Error(`IPC channel '${channel}' is not allowed for invoke.`),
    );
  },

  // Token specific methods
  getToken: (): string | null => {
    return currentToken;
  },
  deleteToken: (): void => {
    console.log(
      "[Preload] deleteToken() called. Requesting main process to delete token.",
    );
    // Ensure "delete-auth-token" is in ALLOWED_SEND_CHANNELS
    if (ALLOWED_SEND_CHANNELS.includes("delete-auth-token")) {
      ipcRenderer.send("delete-auth-token");
    } else {
      console.warn(
        "[Preload] Channel 'delete-auth-token' not allowed for send.",
      );
    }
  },
  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    // Ensure "deep-link-token" is in ALLOWED_LISTEN_CHANNELS
    if (ALLOWED_LISTEN_CHANNELS.includes("deep-link-token")) {
      ipcRenderer.on("deep-link-token", listener);
      return () => {
        ipcRenderer.removeListener("deep-link-token", listener);
      };
    }
    console.warn("[Preload] Channel 'deep-link-token' not allowed for listen.");
    return () => {};
  },
  onTokenDeleted: (callback: () => void): (() => void) => {
    const listener = () => callback();
    // Ensure "auth-token-deleted" is in ALLOWED_LISTEN_CHANNELS
    if (ALLOWED_LISTEN_CHANNELS.includes("auth-token-deleted")) {
      ipcRenderer.on("auth-token-deleted", listener);
      return () => {
        ipcRenderer.removeListener("auth-token-deleted", listener);
      };
    }
    console.warn(
      "[Preload] Channel 'auth-token-deleted' not allowed for listen.",
    );
    return () => {};
  },

  // --- Update related methods for renderer ---
  onUpdateAvailable: (callback: (info: any) => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-available", listener);
    return () => ipcRenderer.removeListener("update-available", listener);
  },
  onUpdateNotAvailable: (callback: (info: any) => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-not-available", listener);
    return () => ipcRenderer.removeListener("update-not-available", listener);
  },
  onUpdateError: (callback: (errorMessage: string) => void) => {
    const listener = (_event: IpcRendererEvent, errorMessage: string) =>
      callback(errorMessage);
    ipcRenderer.on("update-error", listener);
    return () => ipcRenderer.removeListener("update-error", listener);
  },
  onUpdateDownloadProgress: (callback: (progressObj: any) => void) => {
    const listener = (_event: IpcRendererEvent, progressObj: any) =>
      callback(progressObj);
    ipcRenderer.on("update-download-progress", listener);
    return () =>
      ipcRenderer.removeListener("update-download-progress", listener);
  },
  onUpdateDownloaded: (callback: (info: any) => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-downloaded", listener);
    return () => ipcRenderer.removeListener("update-downloaded", listener);
  },
  downloadUpdate: () => {
    // Ensure "download-update" is in ALLOWED_SEND_CHANNELS
    if (ALLOWED_SEND_CHANNELS.includes("download-update")) {
      ipcRenderer.send("download-update");
    } else {
      console.warn("[Preload] Channel 'download-update' not allowed for send.");
    }
  },
  quitAndInstallUpdate: () => {
    // Ensure "quit-and-install-update" is in ALLOWED_SEND_CHANNELS
    if (ALLOWED_SEND_CHANNELS.includes("quit-and-install-update")) {
      ipcRenderer.send("quit-and-install-update");
    } else {
      console.warn(
        "[Preload] Channel 'quit-and-install-update' not allowed for send.",
      );
    }
  },
});

console.log(
  "[Preload] Script loaded. electronAPI exposed with file system agent storage, token logic, and update handling.",
);
