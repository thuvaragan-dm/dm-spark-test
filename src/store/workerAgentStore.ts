import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface WorkerAgentState {
  states: {
    newCategoryName: string;
    isRegisterWorkerAgentModalOpen: boolean;
  };
  actions: {
    setNewCategoryName: Dispatch<SetStateAction<string>>;
    setIsRegisterWorkerAgentModalOpen: Dispatch<SetStateAction<boolean>>;
  };
}

const useWorkerAgentStore = create<WorkerAgentState>()((set) => ({
  states: {
    newCategoryName: "",
    isRegisterWorkerAgentModalOpen: false,
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
    setIsRegisterWorkerAgentModalOpen: (value) =>
      set(({ states }) => {
        const extractedValue =
          typeof value === "function"
            ? value(states.isRegisterWorkerAgentModalOpen)
            : value;
        return {
          states: {
            ...states,
            newCategoryName: !extractedValue ? "" : states.newCategoryName,
            isRegisterWorkerAgentModalOpen: extractedValue,
          },
        };
      }),
  },
}));

export const useWorkerAgent = () =>
  useWorkerAgentStore((state) => state.states);

export const useWorkerAgentActions = () =>
  useWorkerAgentStore((state) => state.actions);
