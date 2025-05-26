/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

// Interface for electron-updater progress object
interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

// Interface for electron-updater UpdateInfo object
// (Matches the structure from electron-updater's UpdateInfo)
interface ElectronUpdateInfo {
  readonly version: string;
  readonly files: Array<{
    readonly url: string;
    readonly sha512: string;
    size?: number | null;
    blockMapSize?: number | null;
  }>;
  readonly path: string;
  readonly sha512: string;
  readonly releaseDate: string;
  releaseName?: string | null;
  releaseNotes?: string | object | Array<object> | null;
  // Add other properties from UpdateInfo if needed
}

interface Window {
  // Optional ipcRenderer access (use electronAPI instead for type safety)
  ipcRenderer?: {
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => () => void; // Return type for cleanup function
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };
  // Strongly typed electronAPI
  electronAPI: {
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => (() => void) | undefined; // Return type for cleanup function
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    osPlatform: NodeJS.Platform;
    getToken: () => string | null;
    deleteToken: () => void;
    onTokenReceived: (callback: (token: string) => void) => () => void;
    onTokenDeleted: (callback: () => void) => () => void;
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

    minimizeWindow: () => void;
    maximizeRestoreWindow: () => void;
    closeWindow: () => void;
    onThemeUpdated: (callback: (isDarkMode: boolean) => void) => () => void;
    onWindowFocused: (callback: () => void) => () => void;
    onWindowBlurred: (callback: () => void) => () => void;
    // Added for the sidebar toggle functionality
    onToggleSidebar: (callback: () => void) => () => void;
  };
}
