import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron";

const AGENT_IPC_CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
};

const ALLOWED_INVOKE_CHANNELS = [...Object.values(AGENT_IPC_CHANNELS)];

const ALLOWED_LISTEN_CHANNELS = [
  "deep-link-token",
  "auth-token-deleted",
  "main-process-message",
  "update-available",
  "update-not-available",
  "update-error",
  "update-download-progress",
  "update-downloaded",
];

const ALLOWED_SEND_CHANNELS = [
  "open-external-url",
  "delete-auth-token",
  "download-update",
  "quit-and-install-update",
];

let currentToken: string | null = null;
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
    ipcRenderer.off(channel, listener);
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
    console.error(`[Preload] Disallowed invoke on channel '${channel}'.`);
    return Promise.reject(
      new Error(`Disallowed invoke on channel '${channel}'.`),
    );
  },
  osPlatform: process.platform,
  getToken: (): string | null => currentToken,
  deleteToken: (): void => {
    ipcRenderer.send("delete-auth-token");
  },
  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    ipcRenderer.on("deep-link-token", listener);
    return () => ipcRenderer.removeListener("deep-link-token", listener);
  },
  onTokenDeleted: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("auth-token-deleted", listener);
    return () => ipcRenderer.removeListener("auth-token-deleted", listener);
  },
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
  downloadUpdate: () => ipcRenderer.send("download-update"),
  quitAndInstallUpdate: () => ipcRenderer.send("quit-and-install-update"),
});

console.log("[Preload] Script loaded and electronAPI exposed.");
