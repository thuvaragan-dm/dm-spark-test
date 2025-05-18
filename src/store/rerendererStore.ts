import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";

interface RerendererState {
  states: {
    rerenderThreadList: number;
  };
  actions: {
    setRerenderThreadList: Dispatch<SetStateAction<number>>;
  };
}

const useSidebarStore = create<RerendererState>()((set) => ({
  states: {
    rerenderThreadList: 0,
  },
  actions: {
    setRerenderThreadList: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          rerenderThreadList:
            typeof value === "function"
              ? value(states.rerenderThreadList)
              : value,
        },
      })),
  },
}));

export const useRerenderer = () => useSidebarStore((state) => state.states);

export const useRerendererActions = () =>
  useSidebarStore((state) => state.actions);
