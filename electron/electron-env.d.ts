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

// Type for MCP parameters object, consistent with preload and main process
type McpDeeplinkParams = Record<string, string | null>;

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
    // Generic listener registration
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => () => void; // Returns a cleanup function
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;

    osPlatform: NodeJS.Platform;

    // Auth Token (original)
    getToken: () => string | null;
    deleteToken: () => void;
    onTokenReceived: (callback: (token: string) => void) => () => void;
    onTokenDeleted: (callback: () => void) => () => void;

    // MCP Tokens/Parameters
    onMCPTokensReceived: (
      callback: (params: McpDeeplinkParams) => void,
    ) => () => void; // UPDATED SIGNATURE

    // Auto Updater
    onUpdateAvailable: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => () => void;
    onUpdateNotAvailable: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => () => void;
    onUpdateError: (callback: (errorMessage: string) => void) => () => void;
    onUpdateDownloadProgress: (
      callback: (progressObj: UpdateProgressInfo) => void,
    ) => () => void;
    onUpdateDownloaded: (
      callback: (info: ElectronUpdateInfo) => void,
    ) => () => void;
    downloadUpdate: () => void;
    quitAndInstallUpdate: () => void;

    // Window Controls
    minimizeWindow: () => void;
    maximizeRestoreWindow: () => void;
    closeWindow: () => void;

    // UI and Theme
    onThemeUpdated: (callback: (isDarkMode: boolean) => void) => () => void;
    onWindowFocused: (callback: () => void) => () => void;
    onWindowBlurred: (callback: () => void) => () => void;
    onToggleSidebar: (callback: () => void) => () => void;
    onToggleSearchBar: (callback: () => void) => () => void;

    // Recently Selected Agents File Management
    deleteRecentAgentsFile: () => Promise<any>;
    onRecentAgentsFileDeleted: (callback: () => void) => () => void;
  };
}
