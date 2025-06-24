import React, { useMemo } from "react";
import { cn } from "../utilities/cn";
import { useSetInitialTheme, useTheme } from "../store/themeStore";

// Define the type for the component's props
interface DashedBorderProps {
  children: React.ReactNode;
  strokeWidth?: number;
  dashLength?: number;
  gapLength?: number;
  borderRadius?: number;
  className?: string;
}

/**
 * A reusable, type-safe component to create a container with a customizable dashed border.
 * Uses an inline SVG as a background image for precise control over the dash-gap effect.
 * The border color and opacity are automatically handled by the useTheme store.
 */
const DashedBorder: React.FC<DashedBorderProps> = ({
  children,
  strokeWidth = 2,
  dashLength = 3,
  gapLength = 8,
  borderRadius = 10,
  className = "",
}) => {
  const { mode } = useTheme();
  const { colorScheme } = useSetInitialTheme();

  let isDarkModeEffective = false;
  if (mode === "system") {
    isDarkModeEffective = colorScheme?.matches ?? false;
  } else {
    isDarkModeEffective = mode === "dark";
  }

  // useMemo now returns an object with both color and opacity
  const borderStyle = useMemo(() => {
    if (isDarkModeEffective) {
      // For dark mode: white color with 10% opacity
      return { color: "white", opacity: 0.2 };
    }
    // For light mode (gray-400): color is #9ca3af with 100% opacity
    return { color: "#9ca3af", opacity: 1 };
  }, [isDarkModeEffective]);

  // We only need to encode the color string now.
  const encodedColor = encodeURIComponent(borderStyle.color);

  // The SVG string is updated to use 'stroke' and 'stroke-opacity' separately
  const svgDataUri = `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${borderRadius}' ry='${borderRadius}' stroke='${encodedColor}' stroke-opacity='${borderStyle.opacity}' stroke-width='${strokeWidth}' stroke-dasharray='${dashLength}%2c ${gapLength}' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`;

  const style: React.CSSProperties = {
    backgroundImage: svgDataUri,
  };

  return (
    <div className={cn("relative", className)} style={style}>
      {children}
    </div>
  );
};

export default DashedBorder;
