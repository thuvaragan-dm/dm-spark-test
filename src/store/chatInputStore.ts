import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Document } from "../api/document/types";

interface ChatInputState {
  states: {
    query: string;
    files: File[];
    fileData: Map<string, Document> | null;
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setFiles: Dispatch<SetStateAction<File[]>>;
    setFileData: Dispatch<SetStateAction<Map<string, Document> | null>>;
    reset: () => void;
  };
}

const useChatInputStore = create<ChatInputState>()((set) => ({
  states: {
    query: "",
    files: [],
    fileData: null,
    suggestions: [],
    videos: [],
  },
  actions: {
    setQuery: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          query: typeof value === "function" ? value(states.query) : value,
        },
      })),

    setFiles: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          files: typeof value === "function" ? value(states.files) : value,
        },
      })),

    setFileData: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          fileData:
            typeof value === "function" ? value(states.fileData) : value,
        },
      })),

    reset: () =>
      set(() => ({
        states: {
          fileData: null,
          files: [],
          query: "",
        },
      })),
  },
}));

export const useChatInput = () => useChatInputStore((state) => state.states);

export const useChatInputActions = () =>
  useChatInputStore((state) => state.actions);
