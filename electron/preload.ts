import { ipcRenderer, contextBridge, IpcRendererEvent } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(
    channel: string,
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void
  ) {
    ipcRenderer.on(channel, listener);
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
});

// --- Token Handling Logic ---

let currentToken: string | null = null;

// Listen for the token sent from the main process
ipcRenderer.on("deep-link-token", (_event: IpcRendererEvent, token: string) => {
  console.log("Preload: Received 'deep-link-token' from main process:", token);
  currentToken = token;
  // Renderer can use electronAPI.onTokenReceived or window.dispatchEvent
  // For example: window.dispatchEvent(new CustomEvent('token-updated', { detail: token }));
});

// Listen for the token deletion confirmation from the main process
ipcRenderer.on("auth-token-deleted", () => {
  console.log("Preload: Received 'auth-token-deleted' from main process.");
  currentToken = null;
  // Renderer can use electronAPI.onTokenDeleted or window.dispatchEvent
  // For example: window.dispatchEvent(new CustomEvent('token-was-deleted'));
});

contextBridge.exposeInMainWorld("electronAPI", {
  /**
   * Retrieves the authentication token currently cached in preload.
   * This token is updated by events from the main process.
   * @returns {string | null} The token, or null if not set or deleted.
   */
  getToken: (): string | null => {
    // console.log("Preload: getToken() called. Returning:", currentToken); // Keep for debugging if needed
    return currentToken;
  },

  /**
   * Sends a request to the main process to delete the stored authentication token.
   * The local `currentToken` in preload will be cleared when the main process
   * sends back an 'auth-token-deleted' event.
   */
  deleteToken: (): void => {
    console.log(
      "Preload: deleteToken() called. Requesting main process to delete token."
    );
    // Ask the main process to delete the token from file and its memory
    ipcRenderer.send("delete-auth-token");
  },

  /**
   * Registers a callback to be invoked when a new token is received from the main process.
   * @param {(token: string) => void} callback - The function to call when a token is received.
   * @returns {() => void} A function to remove the listener.
   */
  onTokenReceived: (callback: (token: string) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, token: string) =>
      callback(token);
    ipcRenderer.on("deep-link-token", listener);
    return () => {
      ipcRenderer.removeListener("deep-link-token", listener);
    };
  },

  /**
   * Registers a callback to be invoked when the main process confirms token deletion.
   * @param {() => void} callback - The function to call when the token has been deleted.
   * @returns {() => void} A function to remove the listener.
   */
  onTokenDeleted: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on("auth-token-deleted", listener);
    return () => {
      ipcRenderer.removeListener("auth-token-deleted", listener);
    };
  },
});

console.log(
  "Preload script loaded. ipcRenderer and electronAPI exposed with updated token logic."
);
