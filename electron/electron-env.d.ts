/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.mjs // Adjusted based on typical Vite Electron setups
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Interfaces for electron-updater data structures
interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
  // Add other fields from electron-updater's ProgressInfo if needed by your app
}

interface ElectronUpdateInfo {
  version: string;
  releaseDate?: string; // This might be part of the release notes or info object
  // Add other fields from electron-updater's UpdateInfo if needed
  // For example: files, path, sha512, releaseName
}

// Used in Renderer process, should match what's exposed in `preload.ts`
interface Window {
  // The generic ipcRenderer exposed by your preload script (if you still expose it directly)
  // It's generally safer to only use the curated `electronAPI`.
  ipcRenderer?: {
    // Made optional as direct access might not be preferred
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => () => void;
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };

  // The specific electronAPI exposed by your preload script
  electronAPI: {
    // Generic IPC methods (matching preload)
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => (() => void) | undefined; // Preload returns () => void, but make it potentially undefined for safety
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;

    // Token specific methods (matching preload)
    getToken: () => string | null;
    deleteToken: () => void;
    onTokenReceived: (callback: (token: string) => void) => () => void;
    onTokenDeleted: (callback: () => void) => () => void;

    // --- Update related methods ---
    onUpdateAvailable: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => (() => void) | undefined;
    onUpdateNotAvailable: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => (() => void) | undefined;
    onUpdateError: (
      callback: (errorMessage: string) => void,
    ) => (() => void) | undefined;
    onUpdateDownloadProgress: (
      callback: (progressObj: UpdateProgressInfo) => void,
    ) => (() => void) | undefined;
    onUpdateDownloaded: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => (() => void) | undefined;
    downloadUpdate: () => void;
    quitAndInstallUpdate: () => void;
  };
}
