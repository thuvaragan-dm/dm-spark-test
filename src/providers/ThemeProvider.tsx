import { ComponentProps, useEffect, useRef } from "react";
import { useSetInitialTheme, useTheme } from "../store/themeStore";
import { cn } from "../utilities/cn";

export interface IThemeProvider extends ComponentProps<"div"> {}

const ThemeProvider = ({ children }: IThemeProvider) => {
  const { colorScheme } = useSetInitialTheme();
  const { theme, mode } = useTheme();
  const previousThemeRef = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    // Determine and apply dark/light mode
    let isDarkModeEffective = false;
    if (mode === "system") {
      isDarkModeEffective = colorScheme?.matches ?? false;
    } else {
      isDarkModeEffective = mode === "dark";
    }

    if (isDarkModeEffective) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply the specific theme palette class to the root <html> element
    const currentThemePalette = theme || "";

    if (
      previousThemeRef.current &&
      previousThemeRef.current !== currentThemePalette
    ) {
      root.classList.remove(previousThemeRef.current);
    }

    if (
      currentThemePalette &&
      currentThemePalette !== previousThemeRef.current
    ) {
      root.classList.add(currentThemePalette);
    }
    previousThemeRef.current = currentThemePalette;
  }, [mode, colorScheme, theme]);

  if (!colorScheme) return null;

  return (
    <div
      className={cn(
        // The `theme` class can also be applied to this div if needed for specific scoped styles,
        // or if global application to <html> is sufficient, this could be omitted.
        // For now, retaining it for consistency with previous structure.
        theme,
        "flex flex-1 flex-col overflow-hidden",
      )}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;
