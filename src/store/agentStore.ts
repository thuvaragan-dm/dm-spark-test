import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Agent } from "../api/agent/types";

export enum ThreadTabs {
  ALL = 1,
  CONVERSATION = 2,
  TASK = 3,
}

interface AgentState {
  states: {
    selectedAgent: Agent | null;
    agents: Agent[];
  };
  actions: {
    setSelectedAgent: Dispatch<SetStateAction<Agent | null>>;
    setAgents: Dispatch<SetStateAction<Agent[]>>;
  };
}

export const useAgentStore = create<AgentState>()((set) => ({
  states: {
    selectedAgent: null,
    agents: [],
  },
  actions: {
    setAgents: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          agents: typeof value === "function" ? value(states.agents) : value,
        },
      })),

    setSelectedAgent: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          selectedAgent:
            typeof value === "function" ? value(states.selectedAgent) : value,
        },
      })),
  },
}));

export const useAgent = () => useAgentStore((state) => state.states);

export const useAgentActions = () => useAgentStore((state) => state.actions);
