import { create } from "zustand";
import { User } from "../api/user/types";
import { apiUrl } from "../api/variables";
import { Dispatch, SetStateAction } from "react";

interface AuthState {
  states: {
    user: User | null;
    accessToken: string | null;
  };
  actions: {
    logout: () => void;
    refetchUser: () => Promise<User | null>;
    setUser: (
      value: User | null | ((value: User | null) => User | null),
    ) => void;
    setAccessToken: Dispatch<SetStateAction<string | null>>;
  };
}

const getInitialUser = (): User | null => {
  if (typeof window === "undefined") return null;
  return null;
};

const getInitialToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.electronAPI.getToken();
};

export const useAuthStore = create<AuthState>((set) => ({
  states: {
    user: getInitialUser(),
    accessToken: getInitialToken(),
  },
  actions: {
    logout: () => {
      window.electronAPI.deleteToken();
      set(({ states }) => ({
        states: {
          ...states,
          accessToken: null,
          user: null,
        },
      }));
    },
    refetchUser: async () => {
      try {
        const token = window.electronAPI.getToken();
        if (!token) return null;

        const userResponse = await fetch(`${apiUrl}/users/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const user: User = await userResponse.json();

        set(({ states }) => ({
          states: {
            ...states,
            user,
          },
        }));

        return user;
      } catch {
        return null;
      }
    },
    setUser: (value) =>
      set(({ states }) => {
        const user = typeof value === "function" ? value(states.user) : value;
        return {
          states: {
            ...states,
            user,
          },
        };
      }),
    setAccessToken: (value) =>
      set(({ states }) => {
        const accessToken =
          typeof value === "function" ? value(states.accessToken) : value;
        return {
          states: {
            ...states,
            accessToken,
          },
        };
      }),
  },
}));

export const useAuth = () => useAuthStore((state) => state.states);

export const useAuthActions = () => {
  const actions = useAuthStore((state) => state.actions);

  return {
    ...actions,
    logout: () => {
      actions.logout();
      //todo: perform redirect
    },
  };
};
