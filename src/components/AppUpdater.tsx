// src/components/AppUpdater.tsx
import React, { useEffect } from "react";
import { toast } from "sonner";
import ErrorAlertComponent from "./alerts/Error";
import InfoAlert from "./alerts/Information";
import SuccessAlert from "./alerts/Success";
import { Button } from "./Button";

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
              Custom={() => (
                <div className="mt-3 flex w-full items-center justify-end gap-2">
                  <Button
                    onClick={() => toast.dismiss("update-available-toast")}
                    className={"rounded-md px-2 py-1 text-xs md:px-2 md:py-1"}
                    variant={"secondary"}
                  >
                    Later
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.electronAPI)
                        window.electronAPI.downloadUpdate();
                      toast.dismiss("update-available-toast");
                    }}
                    className={
                      "rounded-md bg-blue-700 px-2 py-1 text-xs text-white ring-blue-700 hover:bg-blue-600 data-[pressed]:bg-blue-600 md:px-2 md:py-1 dark:bg-blue-700"
                    }
                    variant={"ghost"}
                  >
                    Download now
                  </Button>
                </div>
              )}
            />
          ),
          {
            id: "update-available-toast",
            duration: Infinity,
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
        toast.custom(
          (t) => (
            <InfoAlert
              t={t}
              title={`Downloading update`}
              description="Please wait while we download the update."
              Custom={() => (
                <div className="mt-2 flex w-full items-center justify-between gap-2">
                  <div className="relative h-3 w-full rounded-full bg-white/10">
                    <div
                      style={{ width: `${progressObj.percent}%` }}
                      className="absolute inset-y-0 left-0 m-0.5 animate-pulse rounded-full bg-green-500"
                    ></div>
                  </div>
                  <p className="shrink-0 text-xs font-medium whitespace-nowrap text-gray-600 dark:text-white/60">
                    {Math.round(progressObj.percent)}%
                  </p>
                </div>
              )}
            />
          ),
          {
            id: "update-progress-toast",
            duration: Infinity,
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
              Custom={() => (
                <div className="mt-5 flex w-full items-center justify-end gap-2">
                  <Button
                    onClick={() => toast.dismiss("update-downloaded-toast")}
                    className={"rounded-md px-2 py-1 text-xs md:px-2 md:py-1"}
                    variant={"secondary"}
                  >
                    Later
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.electronAPI)
                        window.electronAPI.quitAndInstallUpdate();
                    }}
                    className={
                      "rounded-md bg-blue-700 px-2 py-1 text-xs text-white ring-blue-700 hover:bg-blue-600 data-[pressed]:bg-blue-600 md:px-2 md:py-1 dark:bg-blue-700"
                    }
                    variant={"ghost"}
                  >
                    Restart & Install
                  </Button>
                </div>
              )}
            />
          ),
          {
            id: "update-downloaded-toast",
            duration: Infinity,
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
