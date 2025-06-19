import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Agent } from "../api/agent/types";

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
    selectedAgent: {
      id: "a088e697-d845-499b-a2e8-f26566c7c41e",
      shard_id: "06ba7a1c-db5d-4a9c-bccd-5bbb3f3d4a01",
      name: "Apex",
      path: "apex",
      prompt: "dd",
      instructions: "",
      description: "Supports processing prior authorization request forms.",
      email_addr_status: "PROVISION_INPROGRESS",
      email_addr: null,
      phone_number_status: "PROVISION_INPROGRESS",
      phone_number: null,
      limit_to_context: false,
      block_nsfw: true,
      tone: "Professional",
      is_active: true,
      public: false,
      hub_theme: "default",
      avatar:
        "https://storage.googleapis.com/dm-dev-public/a088e697-d845-499b-a2e8-f26566c7c41e_SvBbX_avatar.png",
      original_image_url:
        "https://storage.googleapis.com/dm-dev-public/a088e697-d845-499b-a2e8-f26566c7c41e_SvBbX.png",
      is_avatar_enabled: true,
      metadata_fields: {
        default_questions: [
          {
            question: "Set up code base to integrate with Twillo api",
          },
          {
            question: "Check out our interactive demo",
          },
          {
            question: "Estimate your ROI",
          },
          {
            question: "Contact our team",
          },
        ],
      },
      bg_image_url:
        "https://storage.googleapis.com/dm-prod-public/agent_backgrounds/agent_cover_image_024.svg",
      assigned_llm: null,
    },
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
