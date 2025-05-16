import { app, BrowserWindow, dialog } from "electron"; // Added dialog
import { fileURLToPath } from "node:url";
import path from "node:path";
import { URL } from "node:url"; // Import URL for parsing

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let deeplinkUrlToProcess: string | null = null;
let tokenFromDeepLink: string | null = null; // To store the extracted token

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

// Function to parse URL and extract token, then send to renderer
function handleUrlAndExtractToken(url: string) {
  console.log("Handling URL:", url);
  try {
    const parsedUrl = new URL(url); // Use the WHATWG URL parser
    if (parsedUrl.protocol === "dm:") {
      // Ensure it's our protocol
      // Example: dm://auth?token=YOUR_TOKEN
      // You might want to check parsedUrl.hostname or parsedUrl.pathname too
      // e.g. if (parsedUrl.hostname === 'auth') { ... }
      const token = parsedUrl.searchParams.get("token");
      if (token) {
        console.log("Token extracted:", token);
        tokenFromDeepLink = token; // Store it

        // If window is ready, send it immediately
        if (
          win &&
          win.webContents &&
          !win.webContents.isDestroyed() &&
          !win.webContents.isLoading()
        ) {
          sendTokenToRenderer(tokenFromDeepLink);
          // Optionally, you might want to clear tokenFromDeepLink here if it's a one-time send
          // or if the preload script will confirm receipt.
        }
        // The 'did-finish-load' handler for the window will also check tokenFromDeepLink
      } else {
        console.warn(
          "Deep link URL did not contain a 'token' query parameter."
        );
      }
    }
  } catch (e) {
    console.error("Failed to parse deep link URL:", e);
  }

  // Show dialog with the original URL (or a custom message)
  if (app.isReady()) {
    // Only show dialog if app is ready to present UI
    if (!win || win.isDestroyed()) {
      // If no window, we'll show the dialog once it's created and loaded
      // The URL (and token) are stored in deeplinkUrlToProcess / tokenFromDeepLink
    } else {
      processDeepLinkDialog(url); // Show dialog for the full URL
    }
  }
}

// Function to handle the received deep link URL (entry point)
function onDeepLinkReceived(url: string) {
  if (!app.isReady()) {
    deeplinkUrlToProcess = url; // Store the full URL
    // Token extraction will happen once app is ready or window loads
    return;
  }

  // App is ready, handle the URL and extract token
  handleUrlAndExtractToken(url);

  if (!win || win.isDestroyed()) {
    deeplinkUrlToProcess = url; // Keep storing full URL for dialog if window not ready
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  } else {
    if (win.isMinimized()) win.restore();
    win.focus();
    // Token sending is handled by handleUrlAndExtractToken or did-finish-load
  }
}

// Function to show the dialog with the URL
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
    // If no window, we can't show a modal dialog.
    // The URL is stored and will be processed when the window is created.
  }
}

// Function to send the token to the renderer process
function sendTokenToRenderer(token: string | null) {
  if (win && win.webContents && !win.webContents.isDestroyed() && token) {
    console.log("Sending token to renderer:", token);
    win.webContents.send("deep-link-token", token);
  }
}

// Enforce single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    const url = commandLine.find((arg) => arg.startsWith("dm://"));
    if (url) {
      onDeepLinkReceived(url);
    } else if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    const initialUrlFromArgs = process.argv.find((arg) =>
      arg.startsWith("dm://")
    );
    if (initialUrlFromArgs) {
      // Store it, onDeepLinkReceived will be called effectively by did-finish-load if window not ready
      // or directly if window is already somehow ready (less likely path here)
      deeplinkUrlToProcess = initialUrlFromArgs;
      // Attempt to handle early, especially if app is already ready
      onDeepLinkReceived(initialUrlFromArgs);
    }
    createWindow();
  });
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  onDeepLinkReceived(url);
});

// --- End of Deep Linking Setup ---

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"), // Ensure this path is correct
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());

    // If a deeplink URL was captured before window was ready/loaded, process it now
    if (deeplinkUrlToProcess) {
      handleUrlAndExtractToken(deeplinkUrlToProcess); // This will extract token and store in tokenFromDeepLink
      processDeepLinkDialog(deeplinkUrlToProcess); // Show dialog for the full URL
      deeplinkUrlToProcess = null; // Clear after processing
    }
    // Send any stored token
    if (tokenFromDeepLink) {
      sendTokenToRenderer(tokenFromDeepLink);
      // Decide if you want to clear tokenFromDeepLink after sending.
      // If the renderer might not be ready for it immediately, or if you want getToken to work later,
      // you might not clear it here, or have a confirmation mechanism.
      // For simplicity, let's assume one-time send on load is fine.
      // tokenFromDeepLink = null; // Uncomment if token should be cleared after first send attempt
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

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
