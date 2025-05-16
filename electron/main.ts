import { app, BrowserWindow, dialog, ipcMain } from "electron"; // Added dialog, ipcMain
import { fileURLToPath } from "node:url";
import path from "node:path";
import { URL } from "node:url"; // Import URL for parsing
import fs from "node:fs/promises"; // Added fs.promises for async file operations

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let deeplinkUrlToProcess: string | null = null; // Stores URL if received before app/window is ready
let currentAuthToken: string | null = null; // Holds the currently active auth token

const TOKEN_FILE_NAME = "authToken.txt";
function getTokenFilePath(): string {
  return path.join(app.getPath("userData"), TOKEN_FILE_NAME);
}

// --- Token File Operations ---

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
    // If file doesn't exist or other read error, assume no token
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

// Function to parse URL, extract token, save it, and send to renderer
async function handleUrlAndExtractToken(url: string) {
  console.log("Handling URL:", url);
  let extractedToken: string | null = null;
  try {
    // It's recommended to structure your deep link like: dm://callback?authtoken=YOUR_TOKEN
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "dm:") {
      extractedToken = parsedUrl.searchParams.get("authtoken"); // Expect 'authtoken' query param

      if (extractedToken) {
        console.log("Auth token extracted via query param:", extractedToken);
      } else {
        // Fallback: if your URL is exactly "dm://authtoken=ACTUAL_TOKEN"
        // This format is non-standard and new URL() might not parse it as expected.
        // A more direct string manipulation might be needed if this is a strict requirement
        // and the above fails. For example:
        const prefix = "dm://authtoken="; // For "dm://authtoken=TOKEN"
        const prefixGenericPath = "dm:/authtoken="; // For "dm:/authtoken=TOKEN" (pathname)
        if (url.startsWith(prefix)) {
          extractedToken = url.substring(prefix.length);
          console.log(
            "Auth token extracted via custom prefix 'dm://authtoken=':",
            extractedToken
          );
        } else if (url.startsWith(prefixGenericPath)) {
          extractedToken = url.substring(prefixGenericPath.length);
          console.log(
            "Auth token extracted via custom prefix 'dm:/authtoken=':",
            extractedToken
          );
        }
      }

      if (extractedToken) {
        currentAuthToken = extractedToken; // Update in-memory token
        await saveTokenToFile(currentAuthToken); // Save to file (overwrites)

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
          "Deep link URL did not contain an 'authtoken' query parameter or match known custom formats."
        );
      }
    }
  } catch (e) {
    console.error(
      "Failed to parse deep link URL or extract token:",
      e,
      "URL was:",
      url
    );
    // Attempt direct string manipulation as a last resort if URL parsing failed entirely for "dm://authtoken=TOKEN"
    const prefix = "dm://authtoken=";
    if (url.startsWith(prefix)) {
      extractedToken = url.substring(prefix.length);
      console.log(
        "Auth token extracted via fallback custom prefix 'dm://authtoken=':",
        extractedToken
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
        url
      );
    }
  }

  if (app.isReady()) {
    if (!win || win.isDestroyed()) {
      // Window not ready, URL is stored in deeplinkUrlToProcess
      // Dialog will be shown when window loads.
    } else {
      processDeepLinkDialog(url); // Show dialog for the full URL
    }
  }
}

async function onDeepLinkReceived(url: string) {
  if (!app.isReady()) {
    deeplinkUrlToProcess = url;
    return;
  }

  await handleUrlAndExtractToken(url);

  if (!win || win.isDestroyed()) {
    deeplinkUrlToProcess = url; // Keep storing for dialog if window not ready
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(); // Ensure window creation is awaited if it's async due to token loading
    }
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
}

function processDeepLinkDialog(url: string) {
  if (win && !win.isDestroyed()) {
    dialog
      .showMessageBox(win, {
        type: "info",
        title: "Deep Link Opened",
        message: "Application opened with URL:",
        detail: url,
      })
      .catch((err) => console.error("Failed to show dialog:", err));
  } else {
    console.warn(
      "processDeepLinkDialog called but no window available. URL:",
      url
    );
  }
}

function sendTokenToRenderer(token: string | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    console.log("Sending token to renderer:", token);
    win.webContents.send("deep-link-token", token); // Renderer should listen for 'deep-link-token'
  }
}

// --- Single Instance Lock ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async (_event, commandLine) => {
    // Made async
    const url = commandLine.find((arg) => arg.startsWith("dm:")); // More generic dm: prefix
    if (url) {
      await onDeepLinkReceived(url); // Await if onDeepLinkReceived is async
    } else if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  // --- App Ready ---
  app.whenReady().then(async () => {
    // Made async
    currentAuthToken = await loadTokenFromFile(); // Load token at startup

    const initialUrlFromArgs = process.argv.find((arg) =>
      arg.startsWith("dm:")
    ); // More generic dm: prefix
    if (initialUrlFromArgs) {
      deeplinkUrlToProcess = initialUrlFromArgs; // Store for processing after window loads
      // No need to call onDeepLinkReceived here if createWindow and did-finish-load handle it
    }
    await createWindow(); // createWindow might become async if it directly awaits anything
    // For now, its internal 'did-finish-load' handles async token operations
  });
}

// --- open-url event for macOS ---
app.on("open-url", async (event, url) => {
  // Made async
  event.preventDefault();
  await onDeepLinkReceived(url); // Await if onDeepLinkReceived is async
});

// --- IPC Listener for Token Deletion ---
ipcMain.on("delete-auth-token", async () => {
  console.log("Received request to delete auth token.");
  await deleteTokenFromFile();
  currentAuthToken = null;
  // Optionally, notify the renderer that the token has been deleted
  if (win && win.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("auth-token-deleted"); // Renderer should listen for 'auth-token-deleted'
    console.log("Notified renderer of token deletion.");
  }
});

// --- End of Deep Linking & Token Management ---

async function createWindow() {
  // Changed to async as it now contains async operations in did-finish-load indirectly
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on("did-finish-load", async () => {
    // Made async
    win?.webContents.send("main-process-message", new Date().toLocaleString());

    if (deeplinkUrlToProcess) {
      const urlToProcess = deeplinkUrlToProcess; // process one url at a time
      deeplinkUrlToProcess = null; // Clear before async operation
      await handleUrlAndExtractToken(urlToProcess); // Extracts, saves token, updates currentAuthToken
      processDeepLinkDialog(urlToProcess); // Show dialog for the full URL
    }

    // Send current token (either loaded from file, or from a just-processed deeplink)
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // Made async
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow(); // Await if createWindow is async
  }
});
