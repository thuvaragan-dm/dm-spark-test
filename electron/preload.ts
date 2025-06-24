import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron";
import { AppConfiguration } from "./types";

const AGENT_IPC_CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear", // Clears the content of the agents list
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
  DELETE_AGENTS_FILE: "fs-agents:delete-file",
};

// ADDED "get-app-version" to the list of invokable channels
const ALLOWED_INVOKE_CHANNELS = [
  ...Object.values(AGENT_IPC_CHANNELS),
  "get-app-version",
  "get-app-configuration",
  "changelog:should-show",
];

const ALLOWED_LISTEN_CHANNELS = [
  "deep-link-token", // For existing auth token
  "deep-link-mcp-tokens", // Channel for MCP params object
  "auth-token-deleted",
  "main-process-message",
  "update-available",
  "update-not-available",
  "update-error",
  "update-download-progress",
  "update-downloaded",
  "theme-updated",
  "window-focused",
  "window-blurred",
  "toggle-sidebar",
  "toggle-search-bar",
  "recently-agents-file-deleted",
];

const ALLOWED_SEND_CHANNELS = [
  "open-external-url",
  "delete-auth-token",
  "download-update",
  "quit-and-install-update",
  "window-control-minimize",
  "window-control-maximize-restore",
  "window-control-close",
];

let currentToken: string | null = null; // For the original 'authtoken'

ipcRenderer.on("deep-link-token", (_event: IpcRendererEvent, token: string) => {
  console.log("[Preload] Received 'deep-link-token':", token);
  currentToken = token;
});

ipcRenderer.on("auth-token-deleted", () => {
  console.log("[Preload] Received 'auth-token-deleted'.");
  currentToken = null;
});

contextBridge.exposeInMainWorld("electronAPI", {
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) {
    if (ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    }
    console.warn(`[Preload] Disallowed listen on channel '${channel}'`);
    return () => {};
  },
  off(channel: string, listener: (...args: unknown[]) => void) {
    if (ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      ipcRenderer.removeListener(channel, listener);
    } else {
      console.warn(`[Preload] Disallowed off for channel '${channel}'`);
    }
  },
  send(channel: string, ...args: unknown[]) {
    if (ALLOWED_SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`[Preload] Disallowed send on channel '${channel}'`);
    }
  },
  invoke(channel: string, ...args: unknown[]): Promise<any> {
    if (ALLOWED_INVOKE_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    const errorMessage = `[Preload] Disallowed invoke on channel '${channel}'.`;
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  },

  osPlatform: process.platform,

  shouldShowChangelog: (): Promise<boolean> => {
    return ipcRenderer.invoke("changelog:should-show");
  },

  getAppConfiguration: (): Promise<AppConfiguration | null> => {
    return ipcRenderer.invoke("get-app-configuration");
  },

  getAppVersion: (): Promise<string> => {
    return ipcRenderer.invoke("get-app-version");
  },

  getToken: (): string | null => currentToken,

  deleteToken: (): void => {
    currentToken = null;
    ipcRenderer.send("delete-auth-token");
  },

  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const channel = "deep-link-token";
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onTokenDeleted: (callback: () => void): (() => void) => {
    const channel = "auth-token-deleted";
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  // Updated for MCP Params (object)
  onMCPTokensReceived: (
    callback: (params: Record<string, any>) => void,
  ): (() => void) => {
    const channel = "deep-link-mcp-tokens";
    if (!ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      console.warn(
        `[Preload] Attempted to listen on disallowed channel '${channel}' via onMCPTokensReceived. Ensure it's in ALLOWED_LISTEN_CHANNELS.`,
      );
      return () => {};
    }
    const listener = (
      _event: IpcRendererEvent,
      params: Record<string, string | null>,
    ) => callback(params);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  onUpdateAvailable: (callback: (info: any) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-available", listener);
    return () => ipcRenderer.removeListener("update-available", listener);
  },
  onUpdateNotAvailable: (callback: (info: any) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-not-available", listener);
    return () => ipcRenderer.removeListener("update-not-available", listener);
  },
  onUpdateError: (callback: (errorMessage: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, errorMessage: string) =>
      callback(errorMessage);
    ipcRenderer.on("update-error", listener);
    return () => ipcRenderer.removeListener("update-error", listener);
  },
  onUpdateDownloadProgress: (
    callback: (progressObj: any) => void,
  ): (() => void) => {
    const listener = (_event: IpcRendererEvent, progressObj: any) =>
      callback(progressObj);
    ipcRenderer.on("update-download-progress", listener);
    return () =>
      ipcRenderer.removeListener("update-download-progress", listener);
  },
  onUpdateDownloaded: (callback: (info: any) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on("update-downloaded", listener);
    return () => ipcRenderer.removeListener("update-downloaded", listener);
  },
  downloadUpdate: () => ipcRenderer.send("download-update"),
  quitAndInstallUpdate: () => ipcRenderer.send("quit-and-install-update"),

  minimizeWindow: () => ipcRenderer.send("window-control-minimize"),
  maximizeRestoreWindow: () =>
    ipcRenderer.send("window-control-maximize-restore"),
  closeWindow: () => ipcRenderer.send("window-control-close"),

  onThemeUpdated: (callback: (isDarkMode: boolean) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, isDarkMode: boolean) =>
      callback(isDarkMode);
    ipcRenderer.on("theme-updated", listener);
    return () => ipcRenderer.removeListener("theme-updated", listener);
  },
  onWindowFocused: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("window-focused", listener);
    return () => ipcRenderer.removeListener("window-focused", listener);
  },
  onWindowBlurred: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("window-blurred", listener);
    return () => ipcRenderer.removeListener("window-blurred", listener);
  },
  onToggleSidebar: (callback: () => void): (() => void) => {
    const channel = "toggle-sidebar";
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  onToggleSearchBar: (callback: () => void): (() => void) => {
    const channel = "toggle-search-bar";
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  deleteRecentAgentsFile: (): Promise<any> => {
    return ipcRenderer.invoke(AGENT_IPC_CHANNELS.DELETE_AGENTS_FILE);
  },
  onRecentAgentsFileDeleted: (callback: () => void): (() => void) => {
    const channel = "recently-agents-file-deleted";
    if (!ALLOWED_LISTEN_CHANNELS.includes(channel)) {
      console.warn(
        `[Preload] Attempted to listen on disallowed channel '${channel}' via onRecentAgentsFileDeleted.`,
      );
      return () => {};
    }
    const listener = () => callback();
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
