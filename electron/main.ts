import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  nativeTheme,
} from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import { autoUpdater, UpdateInfo } from "electron-updater";

// Determine the correct __dirname for ESM context.
// This should point to the 'dist-electron' folder after build.
let currentDirname: string;
if (typeof __dirname !== "undefined") {
  // __dirname is available (likely CJS or Vite's polyfill for it in dev)
  currentDirname = __dirname;
} else {
  // ESM standard way
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
}

// APP_ROOT is the actual root of your packaged Electron app.
const APP_ROOT = process.env.APP_ROOT || path.join(currentDirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
// MAIN_DIST is where the compiled main process code (main.js, preload.mjs) resides.
export const MAIN_DIST = path.join(APP_ROOT, "dist-electron");
// RENDERER_DIST is where the Vite build output for the renderer (index.html, assets) resides.
export const RENDERER_DIST = path.join(APP_ROOT, "dist");

// VITE_PUBLIC is used by Vite to resolve public assets.
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let deeplinkUrlToProcess: string | null = null;
let currentAuthToken: string | null = null;

const TOKEN_FILE_NAME = "authToken.txt";
const RECENTLY_SELECTED_AGENTS_FILE_NAME = "recentlySelectedAgents.json";

// --- Configure electron-updater ---
autoUpdater.logger = console; // Log updater events to the console
autoUpdater.autoDownload = false; // User will be prompted to download
autoUpdater.autoInstallOnAppQuit = true; // If downloaded, install on quit

// --- Path Helper Functions ---
function getTokenFilePath(): string {
  return path.join(app.getPath("userData"), TOKEN_FILE_NAME);
}

function getRecentlySelectedAgentsFilePath(): string {
  return path.join(app.getPath("userData"), RECENTLY_SELECTED_AGENTS_FILE_NAME);
}

// --- File Operations for Token and Agents ---
async function saveTokenToFile(token: string): Promise<void> {
  try {
    const filePath = getTokenFilePath();
    await fs.writeFile(filePath, token, "utf8");
    console.log("[Main] Auth token saved to file:", filePath);
  } catch (error) {
    console.error("[Main] Failed to save token to file:", error);
  }
}

async function loadTokenFromFile(): Promise<string | null> {
  try {
    const filePath = getTokenFilePath();
    const token = await fs.readFile(filePath, "utf8");
    console.log("[Main] Auth token loaded from file.");
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("[Main] Auth token file not found. No token loaded.");
    } else {
      console.error("[Main] Failed to load token from file:", error);
    }
    return null;
  }
}

async function deleteTokenFromFile(): Promise<void> {
  try {
    const filePath = getTokenFilePath();
    await fs.unlink(filePath);
    console.log("[Main] Auth token file deleted.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("[Main] Auth token file not found, nothing to delete.");
    } else {
      console.error("[Main] Failed to delete token file:", error);
    }
  }
}

interface StoredAgent {
  id: string;
  path: string;
  name: string;
  avatar: string;
  description: string;
}

async function loadRecentlySelectedAgentsFromFile(): Promise<StoredAgent[]> {
  try {
    const filePath = getRecentlySelectedAgentsFilePath();
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as StoredAgent[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(
        "[Main] Recently selected agents file not found. Returning empty list.",
      );
      return [];
    }
    console.error(
      "[Main] Failed to load recently selected agents from file:",
      error,
    );
    return [];
  }
}

async function saveRecentlySelectedAgentsToFile(
  agents: StoredAgent[],
): Promise<void> {
  try {
    const filePath = getRecentlySelectedAgentsFilePath();
    await fs.writeFile(filePath, JSON.stringify(agents, null, 2), "utf8");
    console.log("[Main] Recently selected agents saved to file:", filePath);
  } catch (error) {
    console.error(
      "[Main] Failed to save recently selected agents to file:",
      error,
    );
  }
}

// --- Deep Linking Setup ---
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("dm", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("dm");
}

async function handleUrlAndExtractToken(urlLink: string) {
  console.log("[Main] Handling URL:", urlLink);
  let extractedToken: string | null = null;
  try {
    const parsedUrl = new URL(urlLink);
    if (parsedUrl.protocol === "dm:") {
      extractedToken = parsedUrl.searchParams.get("authtoken");

      if (extractedToken) {
        console.log(
          "[Main] Auth token extracted via query param:",
          extractedToken,
        );
      } else {
        const pathPart = parsedUrl.pathname.startsWith("/")
          ? parsedUrl.pathname.substring(1)
          : parsedUrl.pathname;
        const hostAndPath = `${parsedUrl.hostname}${pathPart}`;
        const tokenPrefix = "authtoken=";
        if (hostAndPath.startsWith(tokenPrefix)) {
          extractedToken = hostAndPath.substring(tokenPrefix.length);
          console.log(
            "[Main] Auth token extracted via path prefix:",
            extractedToken,
          );
        }
      }

      if (extractedToken) {
        currentAuthToken = extractedToken;
        await saveTokenToFile(currentAuthToken);
        if (
          win &&
          win.webContents &&
          !win.webContents.isDestroyed() &&
          !win.webContents.isLoading()
        ) {
          sendTokenToRenderer(currentAuthToken);
        } else {
          console.log(
            "[Main] Window/webContents not ready for immediate token send after extraction.",
          );
        }
      } else {
        console.warn(
          "[Main] Deep link URL did not contain an 'authtoken'. URL:",
          urlLink,
        );
      }
    }
  } catch (e) {
    console.error(
      "[Main] Failed to parse deep link URL or extract token:",
      e,
      "URL was:",
      urlLink,
    );
    const prefix = "dm://authtoken=";
    if (urlLink.startsWith(prefix)) {
      extractedToken = urlLink.substring(prefix.length);
      console.log(
        "[Main] Auth token extracted via fallback string prefix:",
        extractedToken,
      );
      currentAuthToken = extractedToken;
      await saveTokenToFile(currentAuthToken);
      if (
        win &&
        win.webContents &&
        !win.webContents.isDestroyed() &&
        !win.webContents.isLoading()
      ) {
        sendTokenToRenderer(currentAuthToken);
      }
    }
  }
}

async function onDeepLinkReceived(urlLink: string) {
  if (!app.isReady()) {
    console.log("[Main] App not ready, queuing deep link URL:", urlLink);
    deeplinkUrlToProcess = urlLink;
    return;
  }
  await handleUrlAndExtractToken(urlLink);
  if (!win || win.isDestroyed()) {
    console.log(
      "[Main] Window not available after deep link. Queuing URL or creating window.",
    );
    deeplinkUrlToProcess = urlLink;
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
}

function sendTokenToRenderer(token: string | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    console.log("[Main] Sending token to renderer:", token);
    win.webContents.send("deep-link-token", token);
  } else {
    console.warn(
      "[Main] Could not send token to renderer: window/webContents not available or token is null.",
    );
  }
}

// --- Single Instance Lock ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async (_event, commandLine) => {
    const urlFromCmd = commandLine.find((arg) => arg.startsWith("dm:"));
    if (urlFromCmd) {
      await onDeepLinkReceived(urlFromCmd);
    } else if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// --- Function to Apply Theme to TitleBar Overlay ---
function applyThemeToTitleBarOverlay() {
  if (!win || win.isDestroyed() || process.platform === "darwin") {
    // This function is primarily for Windows titleBarOverlay customization
    return;
  }

  const isDarkMode = nativeTheme.shouldUseDarkColors;
  console.log(`[Main] Applying theme to title bar. Dark mode: ${isDarkMode}`);

  try {
    win.setTitleBarOverlay({
      color: "rgba(0, 0, 0, 0)", // Transparent background to blend with web content
      symbolColor: isDarkMode ? "#FFFFFF" : "#000000", // White for dark, Black for light
      // height: 30 // Optional: if you defined a height at creation, keep it consistent or set it here
    });
  } catch (error) {
    console.error("[Main] Failed to set title bar overlay:", error);
  }
}

// --- createWindow Function ---
async function createWindow() {
  const isInitialDarkMode = nativeTheme.shouldUseDarkColors;
  console.log(
    `[Main] Initial dark mode state for window creation: ${isInitialDarkMode}`,
  );

  win = new BrowserWindow({
    width: 1250,
    height: 850,
    minWidth: 950,
    minHeight: 650,
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "rgba(0, 0, 0, 0)", // Transparent background
            symbolColor: isInitialDarkMode ? "#FFFFFF" : "#000000", // Initial symbol color
            // height: 30 // Optional: Adjust height of the overlay bar
          },
        }
      : {}),
  });

  // Ensure theme is applied after window is created, especially for Windows.
  if (process.platform !== "darwin") {
    applyThemeToTitleBarOverlay();
  }

  win.webContents.on("did-finish-load", async () => {
    win?.webContents.send(
      "main-process-message",
      `Main process loaded at: ${new Date().toLocaleString()}`,
    );
    if (deeplinkUrlToProcess) {
      const urlToProcess = deeplinkUrlToProcess;
      deeplinkUrlToProcess = null;
      await handleUrlAndExtractToken(urlToProcess);
    }
    if (currentAuthToken) {
      sendTokenToRenderer(currentAuthToken);
    }

    if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
      if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
        console.warn(
          "[AutoUpdater] GH_TOKEN or GITHUB_TOKEN environment variable is not set. Update check for private repo might fail when running locally.",
        );
      }
      console.log(
        "[AutoUpdater] Checking for updates after window finished loading...",
      );
      autoUpdater.checkForUpdates().catch((err) => {
        console.error(
          "[AutoUpdater] Error in initial checkForUpdates:",
          err.message || err,
        );
        if (win && !win.isDestroyed()) {
          win.webContents.send(
            "update-error",
            "Initial update check failed: " + (err.message || err),
          );
        }
      });
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // win.webContents.openDevTools(); // Uncomment for dev tools
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.on("closed", () => {
    win = null;
  });
}

// --- App Lifecycle Events ---
app.whenReady().then(async () => {
  currentAuthToken = await loadTokenFromFile();
  const initialUrlFromArgs = process.argv.find((arg) => arg.startsWith("dm:"));
  if (initialUrlFromArgs) {
    deeplinkUrlToProcess = initialUrlFromArgs;
  }

  await createWindow();

  // Listen for OS theme changes to update title bar symbols (Windows specific for color options)
  if (process.platform !== "darwin") {
    nativeTheme.on("updated", () => {
      console.log("[Main] OS theme updated event received.");
      applyThemeToTitleBarOverlay();
    });
  }

  // AutoUpdater event listeners
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.on("update-available", (info: UpdateInfo) => {
      console.log("[AutoUpdater] Update available:", info);
      if (win && !win.isDestroyed())
        win.webContents.send("update-available", info);
    });

    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      console.log("[AutoUpdater] Update not available:", info);
      if (win && !win.isDestroyed())
        win.webContents.send("update-not-available", info);
    });

    autoUpdater.on("error", (err) => {
      console.error("[AutoUpdater] Error: ", err.message || err);
      if (win && !win.isDestroyed())
        win.webContents.send(
          "update-error",
          "Update error: " + (err.message || err),
        );
    });

    autoUpdater.on("download-progress", (progressObj) => {
      const log_message = `[AutoUpdater] Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total}, ${progressObj.bytesPerSecond} bytes/s)`;
      console.log(log_message);
      if (win && !win.isDestroyed())
        win.webContents.send("update-download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      console.log("[AutoUpdater] Update downloaded:", info);
      if (win && !win.isDestroyed()) {
        win.webContents.send("update-downloaded", info);
        dialog
          .showMessageBox(win, {
            type: "info",
            title: "Update Ready to Install",
            message: `Version ${info.version} has been downloaded. Restart the application to apply the updates?`,
            buttons: ["Restart Now", "Later"],
            defaultId: 0,
            cancelId: 1,
          })
          .then((result) => {
            if (result.response === 0) {
              autoUpdater.quitAndInstall();
            }
          })
          .catch((err) => {
            console.error(
              "[Main] Error showing update downloaded dialog:",
              err,
            );
          });
      }
    });
  }
});

app.on("open-url", async (event, urlLink: string) => {
  event.preventDefault();
  await onDeepLinkReceived(urlLink);
});

// --- IPC Listeners ---
ipcMain.on("open-external-url", (_event, urlLink: string) => {
  console.log('[Main] Received "open-external-url" with URL:', urlLink);
  if (
    urlLink &&
    (urlLink.startsWith("http://") || urlLink.startsWith("https://"))
  ) {
    shell
      .openExternal(urlLink)
      .then(() =>
        console.log("[Main] Successfully opened URL in external browser."),
      )
      .catch((err) => console.error("[Main] Failed to open URL:", err));
  } else {
    console.warn(
      "[Main] Invalid or missing URL received for open-external-url:",
      urlLink,
    );
  }
});

ipcMain.on("delete-auth-token", async () => {
  console.log("[Main] Received request to delete auth token.");
  await deleteTokenFromFile();
  currentAuthToken = null;
  if (win && win.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("auth-token-deleted");
    console.log("[Main] Notified renderer of token deletion.");
  }
});

// --- IPC Handlers for Recently Selected Agents ---
const AGENT_CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
};

ipcMain.handle(AGENT_CHANNELS.GET_AGENTS, async () =>
  loadRecentlySelectedAgentsFromFile(),
);

ipcMain.handle(
  AGENT_CHANNELS.ADD_AGENT,
  async (_event, agentToAdd: StoredAgent, maxItems = 4) => {
    const currentList = await loadRecentlySelectedAgentsFromFile();
    const updatedList = [
      agentToAdd,
      ...currentList.filter((a) => a.id !== agentToAdd.id),
    ].slice(0, maxItems);
    await saveRecentlySelectedAgentsToFile(updatedList);
    return updatedList;
  },
);

ipcMain.handle(AGENT_CHANNELS.CLEAR_AGENTS, async () => {
  await saveRecentlySelectedAgentsToFile([]);
  return true;
});

ipcMain.handle(
  AGENT_CHANNELS.REMOVE_AGENT,
  async (_event, agentIdToRemove: string) => {
    const currentList = await loadRecentlySelectedAgentsFromFile();
    const updatedList = currentList.filter(
      (agent) => agent.id !== agentIdToRemove,
    );
    await saveRecentlySelectedAgentsToFile(updatedList);
    return updatedList;
  },
);

ipcMain.handle(
  AGENT_CHANNELS.INITIALIZE_AGENTS,
  async (_event, initialAgentsToStore: StoredAgent[]) => {
    const currentList = await loadRecentlySelectedAgentsFromFile();
    if (currentList.length === 0 && initialAgentsToStore.length > 0) {
      await saveRecentlySelectedAgentsToFile(initialAgentsToStore);
      return initialAgentsToStore;
    }
    return currentList;
  },
);

// --- IPC Listeners for Renderer to Control Updates ---
ipcMain.on("download-update", () => {
  console.log("[AutoUpdater] Renderer requested to download update.");
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.downloadUpdate().catch((err) => {
      console.error(
        "[AutoUpdater] Error downloading update:",
        err.message || err,
      );
      if (win && !win.isDestroyed()) {
        win.webContents.send(
          "update-error",
          "Failed to download update: " + (err.message || err),
        );
      }
    });
  } else {
    console.log("[AutoUpdater] Download update skipped in development mode.");
  }
});

ipcMain.on("quit-and-install-update", () => {
  console.log("[AutoUpdater] Renderer requested to quit and install update.");
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.quitAndInstall();
  } else {
    console.log(
      "[AutoUpdater] Quit and install update skipped in development mode.",
    );
  }
});

// --- Standard App Lifecycle Handlers ---
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
