import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Prompt } from "../api/prompt/types";

interface WorkerAgentState {
  states: {
    selectedPromptForEdit: Prompt | null;
    newCategoryName: string;
    isCreatePromptDrawerOpen: boolean;
    isUpdatePromptDrawerOpen: boolean;
  };
  actions: {
    setNewCategoryName: Dispatch<SetStateAction<string>>;
    setSelectedPromptForEdit: Dispatch<SetStateAction<Prompt | null>>;
    setIsCreatePromptDrawerOpen: Dispatch<SetStateAction<boolean>>;
    setIsUpdatePromptDrawerOpen: Dispatch<SetStateAction<boolean>>;
  };
}

const usePromptStore = create<WorkerAgentState>()((set) => ({
  states: {
    newCategoryName: "",
    selectedPromptForEdit: null,
    isCreatePromptDrawerOpen: false,
    isUpdatePromptDrawerOpen: false,
  },
  actions: {
    setNewCategoryName: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          newCategoryName:
            typeof value === "function" ? value(states.newCategoryName) : value,
        },
      })),
    setSelectedPromptForEdit: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          selectedPromptForEdit:
            typeof value === "function"
              ? value(states.selectedPromptForEdit)
              : value,
        },
      })),
    setIsCreatePromptDrawerOpen: (value) =>
      set(({ states }) => {
        const extractedValue =
          typeof value === "function"
            ? value(states.isCreatePromptDrawerOpen)
            : value;
        return {
          states: {
            ...states,
            newCategoryName: !extractedValue ? "" : states.newCategoryName,
            isCreatePromptDrawerOpen: extractedValue,
          },
        };
      }),
    setIsUpdatePromptDrawerOpen: (value) =>
      set(({ states }) => {
        const extractedValue =
          typeof value === "function"
            ? value(states.isUpdatePromptDrawerOpen)
            : value;
        return {
          states: {
            ...states,
            newCategoryName: !extractedValue ? "" : states.newCategoryName,
            isUpdatePromptDrawerOpen: extractedValue,
          },
        };
      }),
  },
}));

export const usePrompt = () => usePromptStore((state) => state.states);

export const usePromptAction = () => usePromptStore((state) => state.actions);
