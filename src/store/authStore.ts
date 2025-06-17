import { create } from "zustand";
import { User } from "../api/user/types";
import { useAppConfigStore } from "./configurationStore"; // Import the configuration store

type MCPAuth = {
  access_token: string;
  expires_in?: string | number;
  refresh_token?: string;
};

interface AuthState {
  states: {
    user: User | null;
    accessToken: string | null;
    MCP: MCPAuth | null;
  };
  actions: {
    logout: () => void;
    refetchUser: () => Promise<User | null>;
    setUser: (
      value: User | null | ((value: User | null) => User | null),
    ) => void;
    setAccessToken: (token: string | null) => void;
    setMCP: (mcp: MCPAuth | null) => void;
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  states: {
    user: null,
    accessToken: null, // Initial state is null, will be populated by listeners/initial check
    MCP: null,
  },
  actions: {
    logout: () => {
      // This is called by the onTokenDeleted listener or manually from the UI
      set({
        states: {
          user: null,
          accessToken: null,
          MCP: null,
        },
      });
    },
    refetchUser: async () => {
      // Get the latest state from both stores
      const token = get().states.accessToken;
      const { apiUrl } = useAppConfigStore.getState().states;

      if (!token) {
        console.log("[AuthStore] refetchUser skipped: No access token.");
        set((state) => ({ states: { ...state.states, user: null } }));
        return null;
      }

      if (!apiUrl) {
        console.error(
          "[AuthStore] refetchUser failed: apiUrl is not yet available from configurationStore.",
        );
        return null;
      }

      try {
        console.log(`[AuthStore] Refetching user from ${apiUrl}...`);
        const userResponse = await fetch(`${apiUrl}/users/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
        }

        const user: User = await userResponse.json();
        set((state) => ({ states: { ...state.states, user } }));
        console.log("[AuthStore] User refetched successfully.");
        return user;
      } catch (error) {
        console.error("[AuthStore] Failed to refetch user:", error);
        get().actions.logout();
        if (window.electronAPI?.deleteToken) {
          window.electronAPI.deleteToken();
        }
        return null;
      }
    },
    setUser: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          user: typeof value === "function" ? value(states.user) : value,
        },
      })),
    setAccessToken: (token) =>
      set(({ states }) => ({
        states: {
          ...states,
          accessToken: token,
        },
      })),
    setMCP: (mcp) =>
      set(({ states }) => ({
        states: {
          ...states,
          MCP: mcp,
        },
      })),
  },
}));

export const useAuth = () => useAuthStore((state) => state.states);

export const useAuthActions = () => {
  const actions = useAuthStore((state) => state.actions);

  const extendedLogout = () => {
    actions.logout();
    if (window.electronAPI?.deleteRecentAgentsFile) {
      window.electronAPI.deleteRecentAgentsFile();
    }
    if (window.electronAPI?.deleteToken) {
      window.electronAPI.deleteToken();
    }
    console.log("[AuthStore] Logout process complete.");
  };

  return {
    ...actions,
    logout: extendedLogout,
  };
};
