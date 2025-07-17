import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { AppConfiguration } from "../../electron/types";

interface ConfigState {
  states: {
    appVersion: string | null;
    apiUrl: string | null;
    loginUrl: string | null;
    posthogApiKey: string | null;
    config: AppConfiguration | null;
    showAnnouncement: boolean;
    showChangelog: boolean;
  };
  actions: {
    setAppVersion: Dispatch<SetStateAction<string | null>>;
    setApiUrl: Dispatch<SetStateAction<string | null>>;
    setLoginUrl: Dispatch<SetStateAction<string | null>>;
    setPosthogApiKey: Dispatch<SetStateAction<string | null>>; // Added setter for PostHog API key
    setConfiguration: Dispatch<SetStateAction<AppConfiguration | null>>;
    setShowAnnouncement: Dispatch<SetStateAction<boolean>>;
    setShowChangelog: Dispatch<SetStateAction<boolean>>;
  };
}

export const useAppConfigStore = create<ConfigState>((set) => ({
  states: {
    apiUrl: null,
    loginUrl: null,
    appVersion: null,
    posthogApiKey: null, // Initial state for PostHog API key
    config: null,
    showAnnouncement: true,
    showChangelog: false,
  },
  actions: {
    setAppVersion: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          appVersion:
            typeof value === "function" ? value(states.appVersion) : value,
        },
      })),
    setApiUrl: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          apiUrl: typeof value === "function" ? value(states.apiUrl) : value,
        },
      })),
    setLoginUrl: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          loginUrl:
            typeof value === "function" ? value(states.loginUrl) : value,
        },
      })),
    // Setter for the PostHog API key
    setPosthogApiKey: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          posthogApiKey:
            typeof value === "function" ? value(states.posthogApiKey) : value,
        },
      })),
    setConfiguration: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          config: typeof value === "function" ? value(states.config) : value,
        },
      })),
    setShowAnnouncement: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          showAnnouncement:
            typeof value === "function"
              ? value(states.showAnnouncement)
              : value,
        },
      })),
    setShowChangelog: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          showChangelog:
            typeof value === "function" ? value(states.showChangelog) : value,
        },
      })),
  },
}));

export const initializeConfiguration = async () => {
  // Destructure the new action
  const {
    setAppVersion,
    setConfiguration,
    setApiUrl,
    setLoginUrl,
    setPosthogApiKey,
  } = useAppConfigStore.getState().actions;

  if (!window.electronAPI) {
    const errorMsg =
      "[ConfigStore] Electron API is not available. Configuration cannot be initialized.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // Fetch both version and the full config from the main process concurrently.
    const [version, appConfig] = await Promise.all([
      window.electronAPI.getAppVersion(),
      window.electronAPI.getAppConfiguration(),
    ]);

    if (!appConfig) {
      throw new Error(
        "Application configuration could not be loaded from the main process.",
      );
    }

    console.log(`[ConfigStore] App Version: ${version}`);
    console.log("[ConfigStore] Configuration received:", appConfig);

    // Set all state values from the fetched data at once.
    setAppVersion(version);
    setConfiguration(appConfig);
    setApiUrl(appConfig.version.backend_url);
    setLoginUrl(appConfig.version.login_url);
    // Set the PostHog API key, defaulting to null if not provided
    setPosthogApiKey(
      appConfig.version.posthog_api_key ??
        appConfig.global.posthog_api_key ??
        null,
    );
  } catch (err) {
    console.error("[ConfigStore] Failed to initialize configuration:", err);
    // Re-throw the error so the calling component (e.g., ConfigurationsLayout)
    // can handle it and show an appropriate error screen to the user.
    throw err;
  }
};

// --- Hooks remain the same, providing easy access to state and actions ---
export const useAppConfig = () => useAppConfigStore((state) => state.states);
export const useAppConfigActions = () =>
  useAppConfigStore((state) => state.actions);
