/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface ElectronUpdateInfo {
  version: string;
  releaseDate?: string;
  files?: Array<{ url: string; sha512: string; size?: number }>;
  path?: string;
  sha512?: string;
  releaseName?: string;
}

interface Window {
  ipcRenderer?: {
    // Making this optional as direct use might be discouraged
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
  electronAPI: {
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[]
      ) => void,
    ) => (() => void) | undefined;
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
  };
}
