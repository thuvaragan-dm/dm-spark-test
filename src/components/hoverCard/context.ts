import { createContext } from "react";

interface HoverCardContextType {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

interface HoverCardMenuContextType {
  closeMenu: () => Promise<void>;
}

// Create context to manage the hover card state with default values
export const HoverCardContext = createContext<HoverCardContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

// Create context to manage the hover card menu actions with default values
export const HoverCardMenuContext = createContext<HoverCardMenuContextType>({
  closeMenu: async () => {},
});
