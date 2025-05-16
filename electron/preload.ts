import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron"; // Added IpcRendererEvent for typing

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void
  ) {
    ipcRenderer.on(channel, listener);
    // It's good practice to return a function to remove the listener,
    // similar to how ipcRenderer.on itself behaves or how Node.js EventEmitter works.
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
  invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args);
  },
  // You can expose other APIs you need here.
  // ...
});

// --- Token Handling Logic ---

// This variable will hold the token received from the main process.
// It's in the preload script's isolated scope.
let currentToken: string | null = null;

// Listen for the token sent from the main process
ipcRenderer.on("deep-link-token", (_event: IpcRendererEvent, token: string) => {
  console.log("Preload: Received token from main process:", token);
  currentToken = token;
  // Optionally, you could dispatch a custom event to the window if your renderer
  // needs to react immediately to the token arrival without polling.
  // Example: window.dispatchEvent(new CustomEvent('token-received', { detail: token }));
});

// Expose token management functions under 'electronAPI' (or any name you prefer)
contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Retrieves the authentication token.
   * @returns {string | null} The token, or null if not set.
   */
  getToken: (): string | null => {
    console.log("Preload: getToken() called. Returning:", currentToken);
    return currentToken;
  },
  /**
   * Deletes the stored authentication token.
   */
  deleteToken: (): void => {
    console.log("Preload: deleteToken() called. Old token:", currentToken);
    currentToken = null;
    console.log("Preload: Token deleted. Current token:", currentToken);
  },
  /**
   * A way for the renderer to be notified when a token is received.
   * This uses a callback pattern.
   * @param {(token: string) => void} callback - The function to call when a token is received.
   * @returns {() => void} A function to remove the listener.
   */
  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    ipcRenderer.on("deep-link-token", listener);
    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener("deep-link-token", listener);
    };
  },
});

console.log("Preload script loaded. ipcRenderer and electronAPI exposed.");
