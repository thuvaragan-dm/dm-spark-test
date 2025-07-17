import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  initializeConfiguration,
  useAppConfig,
} from "../store/configurationStore";
import isVersionSupported from "../utilities/isVersionSupported";
import Blocked from "./Blocked";
import ConfigError from "./ConfigError";
import Initializing from "./Initializing";
import MaintenanceMode from "./MaintenanceMode";
import NotSupported from "./NotSupported";
import PosthogProvider from "../providers/PosthogProvider";

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
    return <Initializing />;
  }

  if (!config || error) {
    return <ConfigError />;
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
    return <Blocked />;
  }

  if (!isSupported) {
    return <NotSupported />;
  }

  if (maintenanceMode) {
    return (
      <MaintenanceMode
        title={maintenanceMode.title}
        message={maintenanceMode.message}
      />
    );
  }

  return (
    <PosthogProvider>
      <Outlet />
    </PosthogProvider>
  );
};

export default ConfigurationsLayout;
