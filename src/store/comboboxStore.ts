import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface ComboboxStore {
  states: {
    isLoading: boolean;
    isOpen: boolean;
    query: string;
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
  };
}

const useComboboxStore = create<ComboboxStore>()((set) => ({
  states: {
    isOpen: false,
    isLoading: false,
    searchResults: [],
    query: "",
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
  },
}));

export const useCombobox = () => useComboboxStore((state) => state.states);

export const useComboboxActions = () =>
  useComboboxStore((state) => state.actions);
