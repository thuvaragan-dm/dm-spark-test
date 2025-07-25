import { create } from "zustand";
import { InfiniteData } from "@tanstack/react-query";
import {
  HandlerInfo,
  MessageHandler,
  StreamStatus,
} from "../app/chat/chatarea/MessageHandler";
import {
  EnumSender,
  Message,
  MessageInput,
  Suggestion,
  Video,
} from "../api/messages/types";
import queryClient from "../api/queryClient";
import { EMessage, messageKey } from "../api/messages/config";
import { useAppConfigStore } from "./configurationStore";

interface CompletedStream {
  completionId: string;
  threadId: string;
  finalData: MessageInput;
}

/**
 * Defines the state and actions for managing real-time message streams.
 */
interface StreamManagerState {
  handlers: Map<string, MessageHandler>;
  messages: Map<string, { botId: string; message: string }>;
  // MODIFICATION: Changed to be message-specific, using the bot ID.
  thinkings: Map<string, { botId: string; thinking: string }>;
  statuses: Map<string, StreamStatus>;
  suggestions: Map<string, Suggestion[]>;
  videos: Map<string, Video[]>;
  threadNames: Map<string, string>;
  handlerInfos: Map<string, HandlerInfo>;
  completedStreams: CompletedStream[];

  getHandler: (threadId: string) => MessageHandler | undefined;
  getOrCreateHandler: (threadId: string, accessToken: string) => MessageHandler;
  updateMessage: (threadId: string, message: string, botId: string) => void;
  getMessage: (
    threadId: string,
  ) => { botId: string; message: string } | undefined;
  // MODIFICATION: Updated signature to include botId.
  updateThinking: (threadId: string, chunk: string, botId: string) => void;
  // MODIFICATION: Updated return type.
  getThinking: (
    threadId: string,
  ) => { botId: string; thinking: string } | undefined;
  // MODIFICATION: Updated signature to include botId.
  updateStatus: (
    threadId: string,
    status: StreamStatus,
    botId: string | null,
  ) => void;
  getStatus: (threadId: string) => StreamStatus | undefined;
  updateSuggestions: (threadId: string, suggestions: Suggestion[]) => void;
  getSuggestions: (threadId: string) => Suggestion[] | undefined;
  updateVideos: (threadId: string, videos: Video[]) => void;
  getVideos: (threadId: string) => Video[] | undefined;
  updateThreadName: (threadId: string, name: string) => void;
  getThreadName: (threadId: string) => string | undefined;
  updateHandlerInfo: (threadId: string, info: HandlerInfo) => void;
  getHandlerInfo: (threadId: string) => HandlerInfo | undefined | null;
  clearSuggestionsAndVideos: (threadId: string) => void;
  removeHandler: (threadId: string) => void;
  processCompletedStreams: (completionIdsToRemove: string[]) => void;
}

export const useStreamManager = create<StreamManagerState>()((set, get) => ({
  // STATE
  handlers: new Map(),
  messages: new Map(),
  // MODIFICATION: Initial state updated to match new structure.
  thinkings: new Map(),
  statuses: new Map(),
  suggestions: new Map(),
  videos: new Map(),
  threadNames: new Map(),
  handlerInfos: new Map(),
  completedStreams: [],

  // GETTERS & ACTIONS
  getHandler: (threadId) => {
    return get().handlers.get(threadId);
  },

  getOrCreateHandler: (threadId, accessToken) => {
    let handler = get().handlers.get(threadId);
    if (!handler) {
      const { apiUrl } = useAppConfigStore.getState().states;
      if (!apiUrl) {
        console.error(
          "[StreamManager] Cannot create handler: apiUrl is not yet available.",
        );
        throw new Error("Cannot initiate chat: API URL is not configured.");
      }

      handler = new MessageHandler(threadId, accessToken, apiUrl);

      // MODIFICATION: Pass botId to updateThinking action.
      handler.on("thinkingChunk", (id, chunk) => {
        get().updateThinking(threadId, chunk, id);
      });

      handler.on("messageChunk", (id, message) => {
        // Update React Query cache directly
        queryClient.setQueryData<InfiniteData<Message[]>>(
          [messageKey[EMessage.FETCH_ALL] + threadId],
          (prev) =>
            updateMessageInCache(prev, id, (msg) => (msg.message += message)),
        );
        // Update Zustand state
        get().updateMessage(threadId, message, id);
      });

      handler.on("suggestions", (_id, suggestions: Suggestion[]) => {
        get().updateSuggestions(threadId, suggestions);
      });

      handler.on("suggestedVideos", (_id, videos: Video[]) => {
        get().updateVideos(threadId, videos);
      });

      // MODIFICATION: Pass botMessageId to updateStatus action.
      handler.on("status", (status, botMessageId) => {
        get().updateStatus(threadId, status, botMessageId);
      });

      handler.on("threadName", (_id, name) => {
        get().updateThreadName(threadId, name);
      });

      handler.on("handlerSelected", (_id, info) => {
        get().updateHandlerInfo(threadId, info);
      });

      handler.on("streamConcluded", (_messageId, finalStreamData) => {
        const finalData: MessageInput = {
          thread_id: threadId,
          message: finalStreamData.message,
          sender: EnumSender.BOT,
          sources: finalStreamData.sources,
          flag: null,
        };

        set((state) => ({
          completedStreams: [
            ...state.completedStreams,
            {
              completionId: `${threadId}-${Date.now()}`,
              threadId: threadId,
              finalData: finalData,
            },
          ],
        }));

        console.log(
          `Stream done for thread ${threadId}. Added to completion queue.`,
        );
        // MODIFICATION: Set status to idle without clearing state here.
        // Clearing is now handled by the 'loading' status change.
        get().updateStatus(threadId, "idle", null);
      });

      set((state) => {
        const newHandlers = new Map(state.handlers);
        newHandlers.set(threadId, handler!);
        return { handlers: newHandlers };
      });
    }
    return handler;
  },

  updateMessage: (threadId, message, botId) => {
    set((state) => {
      const newMessages = new Map(state.messages);
      const current = newMessages.get(threadId);
      newMessages.set(threadId, {
        botId: current?.botId || botId,
        message: (current?.message || "") + message,
      });
      return { messages: newMessages };
    });
  },

  getMessage: (threadId) => {
    return get().messages.get(threadId);
  },

  // MODIFICATION: Reworked to handle message-specific thinking state.
  updateThinking: (threadId, chunk, botId) => {
    set((state) => {
      const newThinkings = new Map(state.thinkings);
      const current = newThinkings.get(threadId);
      // If the botId differs, start a new thinking string; otherwise, append.
      const newThinking =
        current?.botId === botId ? current.thinking + chunk : chunk;
      newThinkings.set(threadId, { botId: botId, thinking: newThinking });
      return { thinkings: newThinkings };
    });
  },

  // MODIFICATION: Returns the new message-specific thinking state.
  getThinking: (threadId) => {
    return get().thinkings.get(threadId);
  },

  // MODIFICATION: Reworked to clear transient state when a new stream starts.
  updateStatus: (threadId, status, _botId) => {
    set((state) => {
      const newStatuses = new Map(state.statuses);
      newStatuses.set(threadId, status);
      let newState: Partial<StreamManagerState> = { statuses: newStatuses };

      // When a new stream starts loading, clear the previous transient message and thinking states.
      if (status === "loading") {
        const newMessages = new Map(state.messages);
        newMessages.delete(threadId);
        const newThinkings = new Map(state.thinkings);
        newThinkings.delete(threadId);
        newState = {
          ...newState,
          messages: newMessages,
          thinkings: newThinkings,
        };
      }
      return newState;
    });
  },

  getStatus: (threadId) => {
    return get().statuses.get(threadId);
  },

  updateSuggestions: (threadId, suggestions) => {
    set((state) => {
      const newSuggestions = new Map(state.suggestions);
      newSuggestions.set(threadId, suggestions);
      return { suggestions: newSuggestions };
    });
  },

  getSuggestions: (threadId) => {
    return get().suggestions.get(threadId);
  },

  updateVideos: (threadId, videos) => {
    set((state) => {
      const newVideos = new Map(state.videos);
      newVideos.set(threadId, videos);
      return { videos: newVideos };
    });
  },

  getVideos: (threadId) => {
    return get().videos.get(threadId);
  },

  updateThreadName: (threadId, name) => {
    set((state) => {
      const newThreadNames = new Map(state.threadNames);
      newThreadNames.set(threadId, name);
      return { threadNames: newThreadNames };
    });
  },

  getThreadName: (threadId) => {
    return get().threadNames.get(threadId);
  },

  updateHandlerInfo: (threadId, info) => {
    set((state) => {
      const newHandlerInfos = new Map(state.handlerInfos);
      newHandlerInfos.set(threadId, info);
      return { handlerInfos: newHandlerInfos };
    });
  },

  getHandlerInfo: (threadId) => {
    if (!threadId) return null;
    return get().handlerInfos.get(threadId);
  },

  clearSuggestionsAndVideos: (threadId) => {
    set((state) => {
      const newSuggestions = new Map(state.suggestions);
      newSuggestions.delete(threadId);
      const newVideos = new Map(state.videos);
      newVideos.delete(threadId);
      return { suggestions: newSuggestions, videos: newVideos };
    });
  },

  processCompletedStreams: (completionIdsToRemove) => {
    set((state) => ({
      completedStreams: state.completedStreams.filter(
        (stream) => !completionIdsToRemove.includes(stream.completionId),
      ),
    }));
  },

  removeHandler: (threadId) => {
    set((state) => {
      const newHandlers = new Map(state.handlers);
      const handler = newHandlers.get(threadId);

      if (handler) {
        handler.stopStreaming();
        newHandlers.delete(threadId);

        const newMessages = new Map(state.messages);
        newMessages.delete(threadId);

        const newThinkings = new Map(state.thinkings);
        newThinkings.delete(threadId);

        const newStatuses = new Map(state.statuses);
        newStatuses.delete(threadId);

        const newSuggestions = new Map(state.suggestions);
        newSuggestions.delete(threadId);

        const newVideos = new Map(state.videos);
        newVideos.delete(threadId);

        const newThreadNames = new Map(state.threadNames);
        newThreadNames.delete(threadId);

        const newHandlerInfos = new Map(state.handlerInfos);
        newHandlerInfos.delete(threadId);

        return {
          handlers: newHandlers,
          messages: newMessages,
          thinkings: newThinkings,
          statuses: newStatuses,
          suggestions: newSuggestions,
          videos: newVideos,
          threadNames: newThreadNames,
          handlerInfos: newHandlerInfos,
        };
      }
      return state;
    });
  },
}));

const updateMessageInCache = (
  prevData: InfiniteData<Message[]> | undefined,
  messageId: string,
  updateFn: (message: Message) => void,
): InfiniteData<Message[]> | undefined => {
  if (!prevData) return undefined;

  const newData = {
    ...prevData,
    pages: prevData.pages.map((page) =>
      page.map((msg) => {
        if (msg.id === messageId) {
          const newMsg = { ...msg };
          updateFn(newMsg);
          return newMsg;
        }
        return msg;
      }),
    ),
  };
  return newData;
};
