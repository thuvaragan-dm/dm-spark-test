// src/components/AppUpdater.tsx
import React, { useEffect } from "react";
import { toast } from "sonner";
// Adjust these import paths if your alert components are located elsewhere
import SuccessAlert from "./alerts/Success";
import InfoAlert from "./alerts/Information";
import ErrorAlertComponent from "./alerts/Error";

interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface ElectronUpdateInfo {
  version: string;
  releaseDate?: string;
  // You can add more fields from electron-updater's UpdateInfo if needed
}

const AppUpdater: React.FC = () => {
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    if (window.electronAPI) {
      const handleUpdateAvailable = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update available:", info);
        toast.custom(
          (t) => (
            <InfoAlert
              t={t}
              title={`Update Available: v${info.version}`}
              description="A new version is ready to download."
            />
          ),
          {
            id: "update-available-toast",
            duration: Infinity,
            action: {
              label: "Download Now",
              onClick: () => {
                if (window.electronAPI) window.electronAPI.downloadUpdate();
                toast.dismiss("update-available-toast");
              },
            },
            cancel: {
              label: "Later",
              onClick: () => toast.dismiss("update-available-toast"),
            },
          },
        );
      };

      const handleUpdateNotAvailable = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update not available:", info);
        // toast.info(`You're up to date! (v${info.version})`); // Optional
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
        toast.loading(
          `Downloading update: ${Math.round(progressObj.percent)}%`,
          {
            id: "update-progress-toast",
            duration: 120000, // Will be dismissed by 'downloaded' or error
          },
        );
      };

      const handleUpdateDownloaded = (info: ElectronUpdateInfo) => {
        console.log("[Renderer] Update downloaded:", info);
        toast.dismiss("update-progress-toast");
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
            duration: Infinity,
            action: {
              label: "Restart & Install",
              onClick: () => {
                if (window.electronAPI)
                  window.electronAPI.quitAndInstallUpdate();
              },
            },
            cancel: {
              label: "Later",
              onClick: () => toast.dismiss("update-downloaded-toast"),
            },
          },
        );
      };

      const unsubscribers = [
        window.electronAPI.onUpdateAvailable?.(handleUpdateAvailable),
        window.electronAPI.onUpdateNotAvailable?.(handleUpdateNotAvailable),
        window.electronAPI.onUpdateError?.(handleUpdateError),
        window.electronAPI.onUpdateDownloadProgress?.(
          handleUpdateDownloadProgress,
        ),
        window.electronAPI.onUpdateDownloaded?.(handleUpdateDownloaded),
      ].filter(Boolean) as (() => void)[];

      cleanupFunctions.push(...unsubscribers);
    } else {
      console.warn(
        "[AppUpdater] window.electronAPI is not defined. Update checks will not work.",
      );
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => {
        if (typeof cleanup === "function") cleanup();
      });
      toast.dismiss("update-available-toast");
      toast.dismiss("update-progress-toast");
      toast.dismiss("update-downloaded-toast");
      toast.dismiss("update-error-toast");
    };
  }, []);

  return null;
};

export default AppUpdater;
