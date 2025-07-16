import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

// A shared interface for the combobox search result objects
interface ComboboxResult {
  id: string;
  name: string;
  onClick?: () => void;
}

// The main interface for the store's state and actions
interface ComboboxStore {
  states: {
    isLoading: boolean;
    isOpen: boolean;
    query: string;
    recentOptions: ComboboxResult[]; // State for recent items
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    addRecentOption: (option: ComboboxResult) => void; // Action for recent items
  };
}

const useComboboxStore = create<ComboboxStore>()((set) => ({
  states: {
    isOpen: false,
    isLoading: false,
    query: "",
    recentOptions: [], // Initialize recent options as an empty array
  },
  actions: {
    setQuery: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          query: typeof value === "function" ? value(states.query) : value,
        },
      })),

    setIsOpen: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          isOpen: typeof value === "function" ? value(states.isOpen) : value,
        },
      })),

    setIsLoading: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          isLoading:
            typeof value === "function" ? value(states.isLoading) : value,
        },
      })),

    // Action to add a new item to the recent options list
    addRecentOption: (option) =>
      set(({ states }) => {
        // Remove the option if it already exists to move it to the top
        const filteredRecents = states.recentOptions.filter(
          (o) => o.id !== option.id,
        );

        // Add the new option to the beginning of the array
        const newRecents = [option, ...filteredRecents];

        // Return the updated state, ensuring the list never exceeds 3 items
        return {
          states: {
            ...states,
            recentOptions: newRecents.slice(0, 3),
          },
        };
      }),
  },
}));

// Hook to access the state values
export const useCombobox = () => useComboboxStore((state) => state.states);

// Hook to access the actions
export const useComboboxActions = () =>
  useComboboxStore((state) => state.actions);
