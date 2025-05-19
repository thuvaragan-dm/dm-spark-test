import { createContext } from "react";

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

interface DropdownMenuContextType {
  closeMenu: () => Promise<void>;
}

// Create context to manage the dropdown state with default values
export const DropdownContext = createContext<DropdownContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

// Create context to manage the dropdown menu actions with default values
export const DropdownMenuContext = createContext<DropdownMenuContextType>({
  closeMenu: async () => {},
});
