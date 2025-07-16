import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface ComboboxResult {
  id: string;
  name: string;
  onClick?: () => void;
}

interface ComboboxStore {
  states: {
    isLoading: boolean;
    isOpen: boolean;
    query: string;
    recentOptions: ComboboxResult[];
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    addRecentOption: (option: ComboboxResult) => void;
  };
}

const useComboboxStore = create<ComboboxStore>()((set) => ({
  states: {
    isOpen: false,
    isLoading: false,
    query: "",
    recentOptions: [],
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

    // --- New action implementation ---
    addRecentOption: (option) =>
      set(({ states }) => {
        // Remove the option if it already exists to move it to the top
        const filteredRecents = states.recentOptions.filter(
          (o) => o.id !== option.id,
        );

        // Add the new option to the beginning of the array
        const newRecents = [option, ...filteredRecents];

        // Return the updated state, ensuring we only keep the last 3 unique items
        return {
          states: {
            ...states,
            recentOptions: newRecents.slice(0, 3),
          },
        };
      }),
  },
}));

export const useCombobox = () => useComboboxStore((state) => state.states);

export const useComboboxActions = () =>
  useComboboxStore((state) => state.actions);
