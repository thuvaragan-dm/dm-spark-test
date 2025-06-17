import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  initializeConfiguration,
  useAppConfig,
} from "../store/configurationStore";
import isVersionSupported from "../utilities/isVersionSupported";

const ConfigurationsLayout = () => {
  const { config, appVersion } = useAppConfig();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeConfiguration();
      } catch (e: any) {
        setError(
          e.message || "An unexpected error occurred during initialization.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-dvh flex-col items-center-safe justify-center-safe">
        Initializing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-dvh flex-col items-center-safe justify-center-safe">
        <h2>Critical Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // After initialization, if config is still null, it's a critical error.
  if (!config) {
    return (
      <div className="flex h-dvh flex-col items-center-safe justify-center-safe">
        <h2>Critical Error</h2>
        <p>Configuration data is missing. The application cannot continue.</p>
      </div>
    );
  }

  const { global: globalConfigs } = config;

  const isBlocked =
    globalConfigs?.version_policy?.blocked?.includes(appVersion ?? "") ?? false;

  const isSupported =
    isVersionSupported(
      appVersion ?? "",
      globalConfigs?.version_policy?.minimum_supported ?? "0.0.0",
    ) ?? false;

  const maintenanceMode = globalConfigs?.maintenance_mode;

  if (isBlocked) {
    return (
      <div className="p-4 text-center">
        This version of the application has been blocked.
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-4 text-center">
        This version of the application is no longer supported. Please update.
      </div>
    );
  }

  if (maintenanceMode) {
    return (
      <div className="flex h-dvh flex-col items-center-safe justify-center-safe p-4 text-center">
        <h2>{maintenanceMode.title}</h2>
        <p>{maintenanceMode.message}</p>
      </div>
    );
  }

  return <Outlet />;
};

export default ConfigurationsLayout;
