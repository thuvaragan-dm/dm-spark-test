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
     * │ │ └── preload.mjs // Adjusted based on typical Vite Electron setups, was preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, should match what's exposed in `preload.ts`
interface Window {
  // The generic ipcRenderer exposed by your preload script
  // This provides direct access, while electronAPI offers a more curated interface.
  ipcRenderer: {
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: any[] // Changed from unknown[] to any[] for broader compatibility if needed, but unknown is safer
      ) => void,
    ) => () => void; // Assuming 'on' returns a cleanup function
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>; // Changed from unknown to any for Promise result
  };

  // The more specific electronAPI exposed by your preload script
  electronAPI: {
    // Generic IPC methods (matching preload)
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent, // Ensure IpcRendererEvent is correctly typed if possible
        ...args: any[]
      ) => void,
    ) => (() => void) | undefined; // Preload returns () => void, but make it potentially undefined for safety
    off: (channel: string, listener: (...args: any[]) => void) => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>; // For fs-agents and potentially other invokes

    // Token specific methods (matching preload)
    getToken: () => string | null;
    deleteToken: () => void;
    onTokenReceived: (callback: (token: string) => void) => () => void; // Returns a cleanup function
    onTokenDeleted: (callback: () => void) => () => void; // Returns a cleanup function
  };
}
