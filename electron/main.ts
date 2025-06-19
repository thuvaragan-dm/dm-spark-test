import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  nativeTheme,
  Menu,
  MenuItemConstructorOptions,
  session,
} from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, URL } from "node:url"; // Added URL for parsing
import { autoUpdater, UpdateInfo } from "electron-updater";
import { AppConfiguration, GlobalAppConfig, VersionAppConfig } from "./types";
import { apiUrl } from "../src/api/variables";

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
// currentAccessToken is removed as we now handle all MCP params as an object
// let currentAccessToken: string | null = null;
let currentMcpParams: Record<string, string | null> | null = null;

const TOKEN_FILE_NAME = "authToken.txt";
const RECENTLY_SELECTED_AGENTS_FILE_NAME = "recentlySelectedAgents.json";
const CHANGELOG_SEEN_FILE_NAME = "changelogSeenVersions.json";

// --- Configure electron-updater ---
autoUpdater.logger = console; // Log updater events to the console
autoUpdater.autoDownload = false; // User will be prompted to download
autoUpdater.autoInstallOnAppQuit = true; // If downloaded, install on quit

// --- Path Helper Functions ---
function getTokenFilePath(): string {
  return path.join(app.getPath("userData"), TOKEN_FILE_NAME);
}

function getChangelogSeenFilePath(): string {
  return path.join(app.getPath("userData"), CHANGELOG_SEEN_FILE_NAME);
}

function getRecentlySelectedAgentsFilePath(): string {
  return path.join(app.getPath("userData"), RECENTLY_SELECTED_AGENTS_FILE_NAME);
}

async function loadChangelogSeenVersions(): Promise<string[]> {
  try {
    const filePath = getChangelogSeenFilePath();
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(
        "[Main] Changelog seen versions file not found. Returning empty array.",
      );
      return [];
    }
    console.error("[Main] Failed to load changelog seen versions:", error);
    return []; // Return empty on other errors to avoid blocking app
  }
}

async function saveChangelogSeenVersions(versions: string[]): Promise<void> {
  try {
    const filePath = getChangelogSeenFilePath();
    await fs.writeFile(filePath, JSON.stringify(versions, null, 2), "utf8");
    console.log("[Main] Changelog seen versions saved to file:", filePath);
  } catch (error) {
    console.error("[Main] Failed to save changelog seen versions:", error);
  }
}

// --- File Operations for Auth Token and Agents ---
async function saveTokenToFile(token: string): Promise<void> {
  try {
    const filePath = getTokenFilePath();
    await fs.writeFile(filePath, token, "utf8");
    console.log("[Main] Auth token saved to file:", filePath);
  } catch (error) {
    console.error("[Main] Failed to save auth token to file:", error);
  }
}

async function loadTokenFromFile(): Promise<string | null> {
  try {
    const filePath = getTokenFilePath();
    const token = await fs.readFile(filePath, "utf8");
    console.log("[Main] Auth token loaded from file.");
    sendAuthTokenToRenderer(token);
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("[Main] Auth token file not found. No token loaded.");
    } else {
      console.error("[Main] Failed to load auth token from file:", error);
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
      console.error("[Main] Failed to delete auth token file:", error);
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

async function deleteRecentlySelectedAgentsFile(): Promise<void> {
  try {
    const filePath = getRecentlySelectedAgentsFilePath();
    await fs.unlink(filePath);
    console.log(
      "[Main] Recently selected agents file deleted successfully:",
      filePath,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(
        "[Main] Recently selected agents file not found, nothing to delete.",
      );
    } else {
      console.error(
        "[Main] Failed to delete recently selected agents file:",
        error,
      );
    }
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

async function handleUrlAndExtractParams(urlLink: string) {
  console.log("[Main] Handling URL:", urlLink);
  let extractedAuthToken: string | null = null;
  let extractedMcpParams: Record<string, string | null> | null = null;

  try {
    const parsedUrl = new URL(urlLink); // Using Node.js URL
    if (parsedUrl.protocol === "dm:") {
      // Check if it's an MCP link (e.g., dm://mcp?accessToken=...)
      if (parsedUrl.hostname === "mcp") {
        extractedMcpParams = {};
        parsedUrl.searchParams.forEach((value, key) => {
          (extractedMcpParams as Record<string, string | null>)[key] = value;
        });
        console.log("[Main] MCP params extracted:", extractedMcpParams);

        if (Object.keys(extractedMcpParams).length > 0) {
          currentMcpParams = extractedMcpParams;
          if (
            win &&
            win.webContents &&
            !win.webContents.isDestroyed() &&
            !win.webContents.isLoading()
          ) {
            sendMcpParamsToRenderer(currentMcpParams);
          } else {
            console.log(
              "[Main] Window/webContents not ready for immediate MCP params send after extraction.",
            );
          }
        } else {
          console.warn(
            "[Main] dm://mcp link had no query parameters.",
            urlLink,
          );
        }
      } else {
        // Handle original authtoken logic (dm://authtoken=... or dm:authtoken=...)
        let authtokenFoundInUrl = false;
        extractedAuthToken = parsedUrl.searchParams.get("authtoken");
        if (extractedAuthToken) {
          console.log(
            "[Main] Auth token extracted via query param 'authtoken':",
            extractedAuthToken,
          );
          authtokenFoundInUrl = true;
        } else {
          const pathPart = parsedUrl.pathname.startsWith("/")
            ? parsedUrl.pathname.substring(1)
            : parsedUrl.pathname;
          const combinedPathForTokenSearch = `${parsedUrl.hostname}${pathPart}`;
          const authTokenPrefix = "authtoken=";
          if (combinedPathForTokenSearch.startsWith(authTokenPrefix)) {
            extractedAuthToken = combinedPathForTokenSearch.substring(
              authTokenPrefix.length,
            );
            console.log(
              "[Main] Auth token extracted via path prefix 'authtoken=':",
              extractedAuthToken,
            );
            authtokenFoundInUrl = true;
          }
        }

        if (authtokenFoundInUrl && extractedAuthToken) {
          currentAuthToken = extractedAuthToken;
          await saveTokenToFile(currentAuthToken);
          if (
            win &&
            win.webContents &&
            !win.webContents.isDestroyed() &&
            !win.webContents.isLoading()
          ) {
            sendAuthTokenToRenderer(currentAuthToken);
          } else {
            console.log(
              "[Main] Window/webContents not ready for immediate auth token send after extraction.",
            );
          }
        } else {
          console.warn(
            "[Main] Deep link URL was not an MCP link and did not contain a recognized 'authtoken'. URL:",
            urlLink,
          );
        }
      }
    }
  } catch (e) {
    console.error(
      "[Main] Failed to parse deep link URL or extract token/params:",
      e,
      "URL was:",
      urlLink,
    );
    // Fallback for dm://authtoken= if URL parsing failed
    const authTokenPrefixString = "dm://authtoken=";
    if (urlLink.startsWith(authTokenPrefixString)) {
      const tempAuthToken = urlLink.substring(authTokenPrefixString.length);
      if (tempAuthToken) {
        extractedAuthToken = tempAuthToken;
        console.log(
          "[Main] Auth token extracted via fallback string prefix 'dm://authtoken=':",
          extractedAuthToken,
        );
        currentAuthToken = extractedAuthToken;
        await saveTokenToFile(currentAuthToken);
        if (
          win &&
          win.webContents &&
          !win.webContents.isDestroyed() &&
          !win.webContents.isLoading()
        ) {
          sendAuthTokenToRenderer(currentAuthToken);
        }
      }
    } else {
      console.warn(
        "[Main] No token or MCP params could be extracted from deep link via fallback:",
        urlLink,
      );
    }
  }
}

async function onDeepLinkReceived(urlLink: string) {
  if (!app.isReady()) {
    console.log("[Main] App not ready, queuing deep link URL:", urlLink);
    deeplinkUrlToProcess = urlLink;
    return;
  }
  await handleUrlAndExtractParams(urlLink); // Updated function name
  if (!win || win.isDestroyed()) {
    console.log(
      "[Main] Window not available after deep link. Queuing URL or creating window.",
    );
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
}

function sendAuthTokenToRenderer(token: string | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    console.log("[Main] Sending auth token to renderer:", token);
    win.webContents.send("deep-link-token", token);
  }
}

function sendMcpParamsToRenderer(params: Record<string, string | null> | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && params) {
    console.log("[Main] Sending MCP params to renderer:", params);
    win.webContents.send("deep-link-mcp-tokens", params); // Channel name from user's preload
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
    return;
  }

  const isDarkMode = nativeTheme.shouldUseDarkColors;
  console.log(`[Main] Applying theme to title bar. Dark mode: ${isDarkMode}`);

  try {
    win.setTitleBarOverlay({
      color: "rgba(0, 0, 0, 0)",
      symbolColor: isDarkMode ? "#FFFFFF" : "#000000",
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
    height: 800,
    minWidth: 950,
    minHeight: 650,
    backgroundColor: "#0B071E",
    // vibrancy: "fullscreen-ui", // on MacOS
    // backgroundMaterial: "acrylic",
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    ...(process.platform === "darwin"
      ? { titleBarStyle: "hiddenInset" }
      : {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: "rgba(0, 0, 0, 0)",
            symbolColor: isInitialDarkMode ? "#FFFFFF" : "#000000",
            height: 35,
          },
        }),
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Check if the response headers contain 'x-frame-options'
    if (
      (details && details?.responseHeaders?.["x-frame-options"]) ||
      details?.responseHeaders?.["X-Frame-Options"]
    ) {
      // Delete the header to allow embedding
      delete details.responseHeaders["x-frame-options"];
      delete details.responseHeaders["X-Frame-Options"];
    }

    callback({ cancel: false, responseHeaders: details.responseHeaders });
  });

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
      await handleUrlAndExtractParams(urlToProcess); // Updated function name
    }

    if (currentAuthToken) {
      sendAuthTokenToRenderer(currentAuthToken);
    }
    if (currentMcpParams) {
      // Send stored MCP params if any
      sendMcpParamsToRenderer(currentMcpParams);
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
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  win.on("closed", () => {
    win = null;
  });

  win.on("focus", () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("window-focused");
    }
  });
  win.on("blur", () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send("window-blurred");
    }
  });
}

// --- Function to fetch the configuration ---
async function fetchAppConfiguration(): Promise<AppConfiguration | null> {
  const version = app.getVersion();
  console.log(`[Main] Fetching configuration for app version: ${version}`);

  try {
    const url = `${apiUrl}/deepmodel-app-config`;
    const globalConfigData = await fetch(`${url}/global`);
    const versionConfigData = await fetch(`${url}/v${version}`);
    const globalConfigResponse =
      (await globalConfigData.json()) as GlobalAppConfig;
    const versionConfigResponse =
      (await versionConfigData.json()) as VersionAppConfig;

    console.log("[Main] Configuration fetched successfully.");
    return {
      global: globalConfigResponse,
      version: versionConfigResponse,
    };
  } catch (error) {
    console.error("[Main] CRITICAL: Failed to fetch app configuration.", error);
    // If the config is critical for the app to run, show an error and quit.
    dialog.showErrorBox(
      "Configuration Error",
      "Could not load critical application configuration. The application will now close.",
    );
    app.quit();
    return null;
  }
}

// --- App Lifecycle Events ---
app.whenReady().then(async () => {
  currentAuthToken = await loadTokenFromFile();
  const initialUrlFromArgs = process.argv.find((arg) => arg.startsWith("dm:"));
  if (initialUrlFromArgs) {
    deeplinkUrlToProcess = initialUrlFromArgs;
  }

  await createWindow();

  const menuTemplateElements: MenuItemConstructorOptions[] = [];

  if (process.platform === "darwin") {
    menuTemplateElements.push({ role: "appMenu" });
  }

  const editSubMenuConditionalItems: MenuItemConstructorOptions[] =
    process.platform === "darwin"
      ? [
          { role: "pasteAndMatchStyle" },
          { role: "delete" },
          { role: "selectAll" },
          { type: "separator" },
          {
            label: "Speech",
            submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
          },
        ]
      : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }];

  menuTemplateElements.push({
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...editSubMenuConditionalItems,
    ],
  });

  menuTemplateElements.push({
    label: "Go",
    submenu: [
      {
        label: "History",
        submenu: [
          {
            label: "Back",
            accelerator: "CmdOrCtrl+[",
            click: () => {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow?.webContents.canGoBack()) {
                focusedWindow.webContents.goBack();
              }
            },
          },
          {
            label: "Forward",
            accelerator: "CmdOrCtrl+]",
            click: () => {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow?.webContents.canGoForward()) {
                focusedWindow.webContents.goForward();
              }
            },
          },
        ],
      },
    ],
  });

  const viewMenuBaseSubItems: MenuItemConstructorOptions[] = [
    {
      label: "Toggle Search Bar",
      accelerator: "CmdOrCtrl+K",
      click: () => {
        if (win && !win.isDestroyed()) {
          win.webContents.send("toggle-search-bar");
        }
      },
    },
    {
      label: "Toggle Sidebar",
      accelerator: "CmdOrCtrl+B",
      click: () => {
        if (win && !win.isDestroyed()) {
          win.webContents.send("toggle-sidebar");
        }
      },
    },
    { type: "separator" },
    { role: "togglefullscreen" },
  ];

  let viewMenuFinalSubItems: MenuItemConstructorOptions[];
  if (VITE_DEV_SERVER_URL) {
    viewMenuFinalSubItems = [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      ...viewMenuBaseSubItems,
    ];
  } else {
    viewMenuFinalSubItems = [
      { role: "toggleDevTools" },
      ...viewMenuBaseSubItems,
    ];
  }
  menuTemplateElements.push({
    label: "View",
    submenu: viewMenuFinalSubItems,
  });

  menuTemplateElements.push({ label: "Window", role: "windowMenu" });

  menuTemplateElements.push({
    label: "Help",
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://deepmodel.ai");
        },
      },
      {
        label: "Check for Updates...",
        click: () => {
          if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
            autoUpdater.checkForUpdates().catch((err) => {
              if (win && !win.isDestroyed()) {
                dialog.showErrorBox(
                  "Update Check Failed",
                  "Could not check for updates: " + (err.message || err),
                );
              }
            });
          } else {
            if (win && !win.isDestroyed()) {
              dialog.showMessageBox(win, {
                type: "info",
                title: "Check for Updates",
                message: "Update checks are disabled in development mode.",
              });
            }
          }
        },
      },
    ],
  });

  const menu = Menu.buildFromTemplate(menuTemplateElements);
  Menu.setApplicationMenu(menu);

  nativeTheme.on("updated", () => {
    if (process.platform !== "darwin") {
      applyThemeToTitleBarOverlay();
    }
    if (win && !win.isDestroyed()) {
      win.webContents.send("theme-updated", nativeTheme.shouldUseDarkColors);
    }
  });

  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.on("update-available", (info: UpdateInfo) => {
      if (win && !win.isDestroyed())
        win.webContents.send("update-available", info);
    });
    autoUpdater.on("update-not-available", (info: UpdateInfo) => {
      if (win && !win.isDestroyed())
        win.webContents.send("update-not-available", info);
    });
    autoUpdater.on("error", (err) => {
      if (win && !win.isDestroyed())
        win.webContents.send(
          "update-error",
          "Update error: " + (err.message || err),
        );
    });
    autoUpdater.on("download-progress", (progressObj) => {
      if (win && !win.isDestroyed())
        win.webContents.send("update-download-progress", progressObj);
    });
    autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send("update-downloaded", info);
        dialog
          .showMessageBox(win, {
            type: "info",
            title: "Update Ready",
            message: `Version ${info.version} downloaded. Restart to apply?`,
            buttons: ["Restart", "Later"],
            defaultId: 0,
            cancelId: 1,
          })
          .then((result) => {
            if (result.response === 0) autoUpdater.quitAndInstall();
          });
      }
    });
  }
});

app.on("open-url", async (event, urlLink: string) => {
  event.preventDefault();
  await onDeepLinkReceived(urlLink);
});

ipcMain.handle("get-app-configuration", async () => {
  return await fetchAppConfiguration();
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("changelog:should-show", async () => {
  const currentVersion = app.getVersion();
  const seenVersions = await loadChangelogSeenVersions();

  if (seenVersions.includes(currentVersion)) {
    console.log(
      `[Main] Changelog for version ${currentVersion} has already been seen.`,
    );
    return false;
  } else {
    console.log(
      `[Main] Changelog for version ${currentVersion} has not been seen. Marking as seen.`,
    );
    seenVersions.push(currentVersion);
    await saveChangelogSeenVersions(seenVersions);
    return true;
  }
});

ipcMain.on("open-external-url", (_event, urlLink: string) => {
  if (urlLink?.startsWith("http")) {
    shell
      .openExternal(urlLink)
      .catch((err) => console.error("[Main] Failed to open URL:", err));
  }
});

ipcMain.on("delete-auth-token", async () => {
  await deleteTokenFromFile();
  await deleteRecentlySelectedAgentsFile();
  currentAuthToken = null;
  currentMcpParams = null; // Also clear MCP params on logout/token deletion
  if (win?.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("auth-token-deleted"); // Notifies renderer to clear its state
  }
});

ipcMain.on("window-control-minimize", () => win?.minimize());
ipcMain.on("window-control-maximize-restore", () => {
  if (win?.isMaximized()) win.unmaximize();
  else win?.maximize();
});
ipcMain.on("window-control-close", () => win?.close());

const AGENT_CHANNELS = {
  GET_AGENTS: "fs-agents:get",
  ADD_AGENT: "fs-agents:add",
  CLEAR_AGENTS: "fs-agents:clear",
  REMOVE_AGENT: "fs-agents:remove",
  INITIALIZE_AGENTS: "fs-agents:initialize",
  DELETE_AGENTS_FILE: "fs-agents:delete-file",
};

ipcMain.handle(AGENT_CHANNELS.GET_AGENTS, loadRecentlySelectedAgentsFromFile);
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
ipcMain.handle(AGENT_CHANNELS.DELETE_AGENTS_FILE, async () => {
  await deleteRecentlySelectedAgentsFile();
  if (win?.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("recently-agents-file-deleted");
  }
  return true;
});
ipcMain.handle(
  AGENT_CHANNELS.REMOVE_AGENT,
  async (_event, agentIdToRemove: string) => {
    const updatedList = (await loadRecentlySelectedAgentsFromFile()).filter(
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

ipcMain.on("download-update", () => {
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.downloadUpdate().catch((err) => {
      if (win && !win.isDestroyed())
        win.webContents.send(
          "update-error",
          "Failed to download update: " + (err.message || err),
        );
    });
  } else {
    if (win && !win.isDestroyed())
      dialog.showMessageBox(win, {
        type: "info",
        title: "Download Update",
        message: "Update downloads disabled in dev.",
      });
  }
});
ipcMain.on("quit-and-install-update", () => {
  if (process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL) {
    autoUpdater.quitAndInstall();
  } else {
    if (win && !win.isDestroyed())
      dialog.showMessageBox(win, {
        type: "info",
        title: "Install Update",
        message: "Update installation disabled in dev.",
      });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) await createWindow();
});
