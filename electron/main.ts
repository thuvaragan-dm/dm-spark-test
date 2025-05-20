// electron/main.ts
import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
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
// In development with Vite, this might be different than in production.
// electron-vite usually sets process.env.APP_ROOT correctly.
// If process.env.APP_ROOT is not set, this is a fallback for production.
// In a typical electron-vite setup, after build, main.js is in `dist-electron`,
// and APP_ROOT would be the parent of `dist-electron` and `dist`.
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

autoUpdater.logger = console;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function getTokenFilePath(): string {
  return path.join(app.getPath("userData"), TOKEN_FILE_NAME);
}

function getRecentlySelectedAgentsFilePath(): string {
  return path.join(app.getPath("userData"), RECENTLY_SELECTED_AGENTS_FILE_NAME);
}

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
  // Renamed url to urlLink to avoid conflict
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
        const prefix = "dm://authtoken=";
        const prefixGenericPath = "dm:/authtoken=";
        if (urlLink.startsWith(prefix)) {
          extractedToken = urlLink.substring(prefix.length);
        } else if (urlLink.startsWith(prefixGenericPath)) {
          extractedToken = urlLink.substring(prefixGenericPath.length);
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
        }
      } else {
        console.warn("[Main] Deep link URL did not contain an 'authtoken'.");
      }
    }
  } catch (e) {
    console.error(
      "[Main] Failed to parse deep link URL:",
      e,
      "URL was:",
      urlLink,
    );
    const prefix = "dm://authtoken="; // Fallback for dm://authtoken=value
    if (urlLink.startsWith(prefix)) {
      extractedToken = urlLink.substring(prefix.length);
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
  // Renamed url to urlLink
  if (!app.isReady()) {
    deeplinkUrlToProcess = urlLink;
    return;
  }
  await handleUrlAndExtractToken(urlLink);
  if (!win || win.isDestroyed()) {
    deeplinkUrlToProcess = urlLink;
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
}

function sendTokenToRenderer(token: string | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    win.webContents.send("deep-link-token", token);
  }
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async (_event, commandLine) => {
    const urlFromCmd = commandLine.find((arg) => arg.startsWith("dm:")); // Renamed url to urlFromCmd
    if (urlFromCmd) await onDeepLinkReceived(urlFromCmd);
    else if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

async function createWindow() {
  win = new BrowserWindow({
    width: 950,
    height: 650,
    minWidth: 950,
    minHeight: 650,
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      // Preload script path is crucial. It should point to the *compiled* preload script.
      // vite-plugin-electron typically outputs preload to `dist-electron/preload.js` (or .mjs).
      // MAIN_DIST should be `dist-electron`
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
  });

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
    if (currentAuthToken) sendTokenToRenderer(currentAuthToken);

    if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
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
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(async () => {
  currentAuthToken = await loadTokenFromFile();
  const initialUrlFromArgs = process.argv.find((arg) => arg.startsWith("dm:"));
  if (initialUrlFromArgs) deeplinkUrlToProcess = initialUrlFromArgs;
  await createWindow();

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
      const log_message = `[AutoUpdater] Downloaded ${progressObj.percent}%`;
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
            title: "Update Ready",
            message: `Version ${info.version} downloaded. Restart to install?`,
            buttons: ["Restart", "Later"],
            defaultId: 0,
            cancelId: 1,
          })
          .then((result) => {
            if (result.response === 0) autoUpdater.quitAndInstall();
          })
          .catch((err) =>
            console.error(
              "[Main] Error showing update downloaded dialog:",
              err,
            ),
          );
      }
    });
  }
});

app.on("open-url", async (event, urlLink: string) => {
  // Renamed url to urlLink
  event.preventDefault();
  await onDeepLinkReceived(urlLink);
});

ipcMain.on("open-external-url", (_event, urlLink: string) => {
  // Renamed url to urlLink
  if (
    urlLink &&
    (urlLink.startsWith("http://") || urlLink.startsWith("https://"))
  ) {
    shell
      .openExternal(urlLink)
      .catch((err) => console.error("[Main] Failed to open URL:", err));
  }
});
ipcMain.on("delete-auth-token", async () => {
  await deleteTokenFromFile();
  currentAuthToken = null;
  if (win && win.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("auth-token-deleted");
  }
});

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
    const list = await loadRecentlySelectedAgentsFromFile();
    const updated = [
      agentToAdd,
      ...list.filter((a) => a.id !== agentToAdd.id),
    ].slice(0, maxItems);
    await saveRecentlySelectedAgentsToFile(updated);
    return updated;
  },
);
ipcMain.handle(
  AGENT_CHANNELS.CLEAR_AGENTS,
  async () => (await saveRecentlySelectedAgentsToFile([]), true),
);
ipcMain.handle(AGENT_CHANNELS.REMOVE_AGENT, async (_event, agentId: string) => {
  const list = await loadRecentlySelectedAgentsFromFile();
  const updated = list.filter((a) => a.id !== agentId);
  await saveRecentlySelectedAgentsToFile(updated);
  return updated;
});
ipcMain.handle(
  AGENT_CHANNELS.INITIALIZE_AGENTS,
  async (_event, initialAgents: StoredAgent[]) => {
    const list = await loadRecentlySelectedAgentsFromFile();
    if (list.length === 0 && initialAgents.length > 0) {
      await saveRecentlySelectedAgentsToFile(initialAgents);
      return initialAgents;
    }
    return list;
  },
);

ipcMain.on("download-update", () => {
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL)
    autoUpdater.downloadUpdate().catch((err) => {
      if (win && !win.isDestroyed())
        win.webContents.send(
          "update-error",
          "Download failed: " + (err.message || err),
        );
    });
});
ipcMain.on("quit-and-install-update", () => {
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL)
    autoUpdater.quitAndInstall();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) await createWindow();
});
