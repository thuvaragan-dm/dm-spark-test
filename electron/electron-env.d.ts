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
     * │ │ └── preload.js // Should likely be preload.mjs or preload.ts based on context
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  // The ipcRenderer exposed by your preload script
  ipcRenderer: {
    on: (
      channel: string,
      listener: (
        event: import("electron").IpcRendererEvent,
        ...args: unknown[]
      ) => void
    ) => () => void;
    off: (channel: string, listener: (...args: unknown[]) => void) => void;
    send: (channel: string, ...args: unknown[]) => void;
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  };

  // The electronAPI for token management exposed by your preload script
  electronAPI: {
    getToken: () => string | null;
    deleteToken: () => void;
    onTokenReceived: (callback: (token: string) => void) => () => void;
  };
}
