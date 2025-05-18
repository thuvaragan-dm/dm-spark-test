import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Suggestion, Video } from "../api/messages/types";

interface ChatInputState {
  states: {
    query: string;
    files: File[];
    fileData: Document | null; //TODO extend this to include multiple files
    suggestions: Suggestion[];
    videos: Video[];
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setFiles: Dispatch<SetStateAction<File[]>>;
    setFileData: Dispatch<SetStateAction<Document | null>>;
    setSuggestions: Dispatch<SetStateAction<Suggestion[]>>;
    setVideos: Dispatch<SetStateAction<Video[]>>;
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

    setSuggestions: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          suggestions:
            typeof value === "function" ? value(states.suggestions) : value,
        },
      })),

    setVideos: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          videos: typeof value === "function" ? value(states.videos) : value,
        },
      })),

    reset: () =>
      set(() => ({
        states: {
          fileData: null,
          files: [],
          query: "",
          suggestions: [],
          videos: [],
        },
      })),
  },
}));

export const useChatInput = () => useChatInputStore((state) => state.states);

export const useChatInputActions = () =>
  useChatInputStore((state) => state.actions);
