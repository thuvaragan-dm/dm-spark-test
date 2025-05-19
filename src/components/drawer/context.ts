import { createContext } from "react";

interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Create context to manage the drawer state with default values
export const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  setIsOpen: () => {},
});
