// electron/main.ts
import { app, BrowserWindow, ipcMain, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let deeplinkUrlToProcess: string | null = null;
let currentAuthToken: string | null = null;

const TOKEN_FILE_NAME = "authToken.txt";
const RECENTLY_SELECTED_AGENTS_FILE_NAME = "recentlySelectedAgents.json"; // New file name

// --- Path Helper Functions ---
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
    console.log("Auth token saved to file:", filePath);
  } catch (error) {
    console.error("Failed to save token to file:", error);
  }
}

async function loadTokenFromFile(): Promise<string | null> {
  try {
    const filePath = getTokenFilePath();
    const token = await fs.readFile(filePath, "utf8");
    console.log("Auth token loaded from file.");
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("Auth token file not found. No token loaded.");
    } else {
      console.error("Failed to load token from file:", error);
    }
    return null;
  }
}

async function deleteTokenFromFile(): Promise<void> {
  try {
    const filePath = getTokenFilePath();
    await fs.unlink(filePath);
    console.log("Auth token file deleted.");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("Auth token file not found, nothing to delete.");
    } else {
      console.error("Failed to delete token file:", error);
    }
  }
}

// --- Recently Selected Agents File Operations (NEW) ---
interface StoredAgent {
  // Must match the interface in renderer/store
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
        "Recently selected agents file not found. Returning empty list.",
      );
      return [];
    }
    console.error("Failed to load recently selected agents from file:", error);
    return [];
  }
}

async function saveRecentlySelectedAgentsToFile(
  agents: StoredAgent[],
): Promise<void> {
  try {
    const filePath = getRecentlySelectedAgentsFilePath();
    await fs.writeFile(filePath, JSON.stringify(agents, null, 2), "utf8"); // Pretty print
    console.log("Recently selected agents saved to file:", filePath);
  } catch (error) {
    console.error("Failed to save recently selected agents to file:", error);
  }
}

// --- Deep Linking Setup (existing) ---
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("dm", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("dm");
}

async function handleUrlAndExtractToken(url: string) {
  // (existing function)
  console.log("Handling URL:", url);
  let extractedToken: string | null = null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "dm:") {
      extractedToken = parsedUrl.searchParams.get("authtoken");

      if (extractedToken) {
        console.log("Auth token extracted via query param:", extractedToken);
      } else {
        const prefix = "dm://authtoken=";
        const prefixGenericPath = "dm:/authtoken=";
        if (url.startsWith(prefix)) {
          extractedToken = url.substring(prefix.length);
          console.log(
            "Auth token extracted via custom prefix 'dm://authtoken=':",
            extractedToken,
          );
        } else if (url.startsWith(prefixGenericPath)) {
          extractedToken = url.substring(prefixGenericPath.length);
          console.log(
            "Auth token extracted via custom prefix 'dm:/authtoken=':",
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
        }
      } else {
        console.warn(
          "Deep link URL did not contain an 'authtoken' query parameter or match known custom formats.",
        );
      }
    }
  } catch (e) {
    console.error(
      "Failed to parse deep link URL or extract token:",
      e,
      "URL was:",
      url,
    );
    const prefix = "dm://authtoken=";
    if (url.startsWith(prefix)) {
      extractedToken = url.substring(prefix.length);
      console.log(
        "Auth token extracted via fallback custom prefix 'dm://authtoken=':",
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
    } else {
      console.warn(
        "URL parsing failed and no token found with fallback prefix for:",
        url,
      );
    }
  }

  if (app.isReady()) {
    if (!win || win.isDestroyed()) {
      // Window not ready
    }
  }
}

async function onDeepLinkReceived(url: string) {
  // (existing function)
  if (!app.isReady()) {
    deeplinkUrlToProcess = url;
    return;
  }
  await handleUrlAndExtractToken(url);
  if (!win || win.isDestroyed()) {
    deeplinkUrlToProcess = url;
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
}

function sendTokenToRenderer(token: string | null) {
  // (existing function)
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    console.log("Sending token to renderer:", token);
    win.webContents.send("deep-link-token", token);
  }
}

// --- Single Instance Lock (existing) ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith("dm:"));
    if (url) {
      await onDeepLinkReceived(url);
    } else if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    // (existing)
    currentAuthToken = await loadTokenFromFile();
    const initialUrlFromArgs = process.argv.find((arg) =>
      arg.startsWith("dm:"),
    );
    if (initialUrlFromArgs) {
      deeplinkUrlToProcess = initialUrlFromArgs;
    }
    await createWindow();
  });
}

app.on("open-url", async (event, url) => {
  // (existing)
  event.preventDefault();
  await onDeepLinkReceived(url);
});

// --- IPC Listeners (existing and new) ---
ipcMain.on("open-external-url", (_event, url) => {
  console.log('Main Process: Received "open-external-url" with URL:', url);
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    shell
      .openExternal(url)
      .then(() =>
        console.log(
          "Main Process: Successfully opened URL in external browser.",
        ),
      )
      .catch((err) => console.error("Main Process: Failed to open URL:", err));
  } else {
    console.warn("Main Process: Invalid or missing URL received:", url);
  }
});

ipcMain.on("delete-auth-token", async () => {
  // (existing)
  console.log("Received request to delete auth token.");
  await deleteTokenFromFile();
  currentAuthToken = null;
  if (win && win.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("auth-token-deleted");
    console.log("Notified renderer of token deletion.");
  }
});

// --- IPC Handlers for Recently Selected Agents (NEW) ---
const AGENT_CHANNELS = {
  // Must match renderer store and preload
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
};

ipcMain.handle(AGENT_CHANNELS.GET_AGENTS, async () => {
  console.log(`IPC Main: Handling ${AGENT_CHANNELS.GET_AGENTS}`);
  return await loadRecentlySelectedAgentsFromFile();
});

ipcMain.handle(
  AGENT_CHANNELS.ADD_AGENT,
  async (_event, agentToAdd: StoredAgent, maxItems: number = 5) => {
    console.log(
      `IPC Main: Handling ${AGENT_CHANNELS.ADD_AGENT}`,
      agentToAdd,
      maxItems,
    );
    const currentList = await loadRecentlySelectedAgentsFromFile();
    const filteredList = currentList.filter((a) => a.id !== agentToAdd.id);
    const updatedList = [agentToAdd, ...filteredList];
    const trimmedList = updatedList.slice(0, maxItems);
    await saveRecentlySelectedAgentsToFile(trimmedList);
    return trimmedList;
  },
);

ipcMain.handle(AGENT_CHANNELS.CLEAR_AGENTS, async () => {
  console.log(`IPC Main: Handling ${AGENT_CHANNELS.CLEAR_AGENTS}`);
  await saveRecentlySelectedAgentsToFile([]);
  return true; // Indicate success
});

ipcMain.handle(
  AGENT_CHANNELS.REMOVE_AGENT,
  async (_event, agentIdToRemove: string) => {
    console.log(
      `IPC Main: Handling ${AGENT_CHANNELS.REMOVE_AGENT}`,
      agentIdToRemove,
    );
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
    console.log(
      `IPC Main: Handling ${AGENT_CHANNELS.INITIALIZE_AGENTS}`,
      initialAgentsToStore,
    );
    const currentList = await loadRecentlySelectedAgentsFromFile();
    if (currentList.length === 0 && initialAgentsToStore.length > 0) {
      await saveRecentlySelectedAgentsToFile(initialAgentsToStore);
      return initialAgentsToStore;
    }
    return currentList;
  },
);

// --- End of Deep Linking & Token Management & Agent Storage ---

async function createWindow() {
  // (existing function, minor internal async changes)
  win = new BrowserWindow({
    width: 950,
    height: 650,
    minWidth: 950,
    minHeight: 650,
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
  });

  win.webContents.on("did-finish-load", async () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    if (deeplinkUrlToProcess) {
      const urlToProcess = deeplinkUrlToProcess;
      deeplinkUrlToProcess = null;
      await handleUrlAndExtractToken(urlToProcess);
    }
    if (currentAuthToken) {
      sendTokenToRenderer(currentAuthToken);
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

app.on("window-all-closed", () => {
  // (existing)
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // (existing)
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
