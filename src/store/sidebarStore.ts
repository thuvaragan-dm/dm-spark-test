import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { EThread } from "../api/thread/config";

interface SidebarState {
  states: {
    isSidebarVisible: boolean;
    isSidebarExpanded: boolean;
    activeThreadFilter: EThread;
  };
  actions: {
    setIsSidebarVisible: Dispatch<SetStateAction<boolean>>;
    setIsSidebarExpanded: Dispatch<SetStateAction<boolean>>;
    setActiveThreadFilter: Dispatch<SetStateAction<EThread>>;
  };
}

const useSidebarStore = create<SidebarState>()((set) => ({
  states: {
    isSidebarVisible: false,
    isSidebarExpanded: true,
    activeThreadFilter: 1,
  },
  actions: {
    setIsSidebarVisible: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          isSidebarVisible:
            typeof value === "function"
              ? value(states.isSidebarVisible)
              : value,
        },
      })),

    setIsSidebarExpanded: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          isSidebarExpanded:
            typeof value === "function"
              ? value(states.isSidebarExpanded)
              : value,
        },
      })),

    setActiveThreadFilter: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          activeThreadFilter:
            typeof value === "function"
              ? value(states.activeThreadFilter)
              : value,
        },
      })),
  },
}));

export const useSidebar = () => useSidebarStore((state) => state.states);

export const useSidebarActions = () =>
  useSidebarStore((state) => state.actions);
