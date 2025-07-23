import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { create } from "zustand";

type Mode = "dark" | "light" | "system";

export interface ThemeState {
  states: {
    theme: string;
    mode: Mode;
  };
  actions: {
    setTheme: Dispatch<SetStateAction<string>>;
    setMode: Dispatch<SetStateAction<Mode>>;
  };
}

export const useThemeStore = create<ThemeState>()((set) => ({
  states: {
    mode: "dark",
    theme: "default",
  },
  actions: {
    setTheme: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          theme: typeof value === "function" ? value(states.theme) : value,
        },
      })),
    setMode: (value) =>
      set(({ states }) => {
        const extractedValue =
          typeof value === "function" ? value(states.mode) : value;
        const modeValue = extractedValue ?? "dark";
        return {
          states: {
            ...states,
            mode: modeValue,
          },
        };
      }),
  },
}));

export const useTheme = () => useThemeStore((state) => state.states);
export const useThemeActions = () => useThemeStore((state) => state.actions);
export const useSetInitialTheme = () => {
  const { setMode } = useThemeActions();
  const [colorScheme, setColorScheme] = useState<MediaQueryList | null>(null);

  useEffect(() => {
    // const colorMode = Cookie.get(cookieKeys.COLOR_MODE) as Mode;
    // setMode(colorMode);
    setColorScheme(window.matchMedia("(prefers-color-scheme: dark)"));
  }, [setMode, setColorScheme]);

  useEffect(() => {
    const handleChange = () => {
      setColorScheme(window.matchMedia("(prefers-color-scheme: dark)"));
    };

    colorScheme?.addEventListener("change", handleChange);

    return () => {
      colorScheme?.removeEventListener("change", handleChange);
    };
  }, [colorScheme]);

  return { colorScheme };
};
