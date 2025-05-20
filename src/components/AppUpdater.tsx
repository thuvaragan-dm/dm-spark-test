// src/components/AppUpdater.tsx
import React, { useEffect } from "react";
import { toast } from "sonner";
import SuccessAlert from "./alerts/Success";
import InfoAlert from "./alerts/Information";
import ErrorAlertComponent from "./alerts/Error"; // Renamed to avoid conflict if 'Error' is a common name

// Define interfaces based on what electron-updater typically provides
// You can expand these based on the actual structure of `info` and `progressObj`
interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
  // Add other fields from electron-updater's ProgressInfo if needed by your app
}

interface ElectronUpdateInfo {
  version: string;
  releaseDate?: string; // This might be part of the release notes or info object
  // Add other fields from electron-updater's UpdateInfo if needed
  // For example: files, path, sha512, releaseName
}

const AppUpdater: React.FC = () => {
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Ensure electronAPI is available on the window object
    if (window.electronAPI) {
      const handleUpdateAvailable = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update available:", info);
        toast.custom(
          (
            t, // t is the toast id, pass it to your custom component if it needs to dismiss itself
          ) => (
            <InfoAlert
              t={t}
              title={`Update Available: v${info.version}`}
              description="A new version is ready to download."
            />
          ),
          {
            id: "update-available-toast", // Use a unique ID for the toast
            duration: Infinity, // Keep the toast until the user interacts
            action: {
              label: "Download Now",
              onClick: () => {
                if (window.electronAPI) window.electronAPI.downloadUpdate();
                toast.dismiss("update-available-toast"); // Dismiss this toast on action
              },
            },
            cancel: {
              // `cancel` in sonner usually means a dismiss button
              label: "Later",
              onClick: () => toast.dismiss("update-available-toast"),
            },
            // You can add more props like `cancel` for a "Later" button if sonner supports it
          },
        );
      };

      const handleUpdateNotAvailable = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update not available:", info);
        // Optionally, inform the user if they manually checked for updates
        // For example: toast.info(`You're up to date! (v${info.version})`);
      };

      const handleUpdateError = (errorMessage: string) => {
        console.error("[Renderer] Update error:", errorMessage);
        toast.custom(
          (t) => (
            <ErrorAlertComponent
              t={t}
              title="Update Error"
              description={errorMessage}
            />
          ),
          { id: "update-error-toast", duration: 10000 },
        );
      };

      const handleUpdateDownloadProgress = (
        progressObj: UpdateProgressInfo,
      ) => {
        console.log("[Renderer] Download progress:", progressObj.percent);
        // Using a standard toast for progress, which will auto-dismiss or can be updated by re-calling toast with the same ID
        toast.loading(
          `Downloading update: ${Math.round(progressObj.percent)}%`,
          {
            id: "update-progress-toast", // Use a consistent ID to allow updates
            duration: 120000, // Keep it alive while downloading, or update it by re-calling toast
          },
        );
      };

      const handleUpdateDownloaded = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update downloaded:", info);
        toast.dismiss("update-progress-toast"); // Clear any existing progress toast
        toast.custom(
          (t) => (
            <SuccessAlert
              t={t}
              title={`Update Ready: v${info.version}`}
              description="The application will restart to apply the update."
            />
          ),
          {
            id: "update-downloaded-toast",
            duration: Infinity, // Keep until user interacts
            action: {
              label: "Restart & Install",
              onClick: () => {
                if (window.electronAPI)
                  window.electronAPI.quitAndInstallUpdate();
                // No need to dismiss the toast here, as the app will quit
              },
            },
            cancel: {
              label: "Later", // User can choose to restart later manually
              onClick: () => toast.dismiss("update-downloaded-toast"),
            },
          },
        );
      };

      // Subscribe to events and store cleanup functions
      // Check if each method exists before calling, to prevent errors if preload wasn't fully set up
      const unsubAvailable = window.electronAPI.onUpdateAvailable?.(
        handleUpdateAvailable,
      );
      const unsubNotAvailable = window.electronAPI.onUpdateNotAvailable?.(
        handleUpdateNotAvailable,
      );
      const unsubError = window.electronAPI.onUpdateError?.(handleUpdateError);
      const unsubProgress = window.electronAPI.onUpdateDownloadProgress?.(
        handleUpdateDownloadProgress,
      );
      const unsubDownloaded = window.electronAPI.onUpdateDownloaded?.(
        handleUpdateDownloaded,
      );

      // Add cleanup functions to the array if they are returned (i.e., if subscription was successful)
      if (unsubAvailable) cleanupFunctions.push(unsubAvailable);
      if (unsubNotAvailable) cleanupFunctions.push(unsubNotAvailable);
      if (unsubError) cleanupFunctions.push(unsubError);
      if (unsubProgress) cleanupFunctions.push(unsubProgress);
      if (unsubDownloaded) cleanupFunctions.push(unsubDownloaded);
    } else {
      console.warn(
        "[AppUpdater] window.electronAPI is not defined. Update checks will not work.",
      );
    }

    // Cleanup function to remove all listeners when the component unmounts
    return () => {
      cleanupFunctions.forEach((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
      // Optionally dismiss any persistent toasts if the component unmounts
      toast.dismiss("update-available-toast");
      toast.dismiss("update-progress-toast");
      toast.dismiss("update-downloaded-toast");
      toast.dismiss("update-error-toast");
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return null; // This component is for logic and side-effects (toasts), not direct UI rendering.
};

export default AppUpdater;
