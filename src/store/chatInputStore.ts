import { Dispatch, SetStateAction } from "react";
import { create } from "zustand";
import { Suggestion, Video } from "../api/messages/types";
import { Document } from "../api/document/types";

interface ChatInputState {
  states: {
    query: string;
    files: File[];
    fileData: Document | null; //TODO extend this to include multiple files
    suggestions: Suggestion[];
    videos: Video[];
    activeStreamOriginThreadIdRef: string | null;
  };

  actions: {
    setQuery: Dispatch<SetStateAction<string>>;
    setActiveStreamOriginThreadIdRef: Dispatch<SetStateAction<string | null>>;
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
    activeStreamOriginThreadIdRef: null,
  },
  actions: {
    setQuery: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          query: typeof value === "function" ? value(states.query) : value,
        },
      })),
    setActiveStreamOriginThreadIdRef: (value) =>
      set(({ states }) => ({
        states: {
          ...states,
          activeStreamOriginThreadIdRef:
            typeof value === "function"
              ? value(states.activeStreamOriginThreadIdRef)
              : value,
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
      set(({ states }) => ({
        states: {
          ...states,
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
