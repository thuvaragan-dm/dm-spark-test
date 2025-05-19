import { useMediaQuery } from "react-responsive";

// Define Tailwind CSS v4 default breakpoints in pixels
// These values are based on Tailwind's default configuration (as of v4)
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Create a type for the breakpoint keys
type BreakpointKey = keyof typeof breakpoints;

// The useBreakpoint hook
export function useBreakpoint<K extends BreakpointKey>(breakpoint: K) {
  return useMediaQuery({
    query: `(min-width: ${breakpoints[breakpoint]})`,
  });
}
