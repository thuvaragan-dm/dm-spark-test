import { create } from "zustand";
import { InfiniteData } from "@tanstack/react-query";
import {
  MessageHandler,
  StreamStatus,
} from "../app/chat/chatarea/MessageHandler"; // Adjust path as needed
import {
  EnumSender,
  Message,
  MessageInput,
  Suggestion,
  Video,
} from "../api/messages/types"; // Adjust path as needed
import queryClient from "../api/queryClient"; // Adjust path as needed
import { EMessage, messageKey } from "../api/messages/config"; // Adjust path as needed

/**
 * Defines the shape of a completed stream event, which is queued for persistence.
 */
interface CompletedStream {
  completionId: string; // A unique ID for this specific completion event
  threadId: string;
  finalData: MessageInput;
}

/**
 * Defines the state and actions for managing real-time message streams.
 */
interface StreamManagerState {
  handlers: Map<string, MessageHandler>;
  messages: Map<string, { botId: string; message: string }>;
  statuses: Map<string, StreamStatus>;
  suggestions: Map<string, Suggestion[]>; // Changed to Suggestion[]
  videos: Map<string, Video[]>; // Changed to Video[]
  completedStreams: CompletedStream[];

  getHandler: (threadId: string) => MessageHandler | undefined;
  getOrCreateHandler: (
    threadId: string,
    agentId: string,
    accessToken: string,
  ) => MessageHandler;
  updateMessage: (threadId: string, message: string, botId: string) => void;
  getMessage: (
    threadId: string,
  ) => { botId: string; message: string } | undefined;
  updateStatus: (threadId: string, status: StreamStatus) => void;
  getStatus: (threadId: string) => StreamStatus | undefined;
  updateSuggestions: (threadId: string, suggestions: Suggestion[]) => void; // Changed to Suggestion[]
  getSuggestions: (threadId: string) => Suggestion[] | undefined; // Changed to Suggestion[]
  updateVideos: (threadId: string, videos: Video[]) => void; // Changed to Video[]
  getVideos: (threadId: string) => Video[] | undefined; // Changed to Video[]
  clearSuggestionsAndVideos: (threadId: string) => void; // Added function
  removeHandler: (threadId: string) => void;
  processCompletedStreams: (completionIdsToRemove: string[]) => void;
}

export const useStreamManager = create<StreamManagerState>()((set, get) => ({
  // STATE
  handlers: new Map(),
  messages: new Map(),
  statuses: new Map(),
  suggestions: new Map(),
  videos: new Map(),
  completedStreams: [],

  // GETTERS & ACTIONS
  getHandler: (threadId) => {
    return get().handlers.get(threadId);
  },

  getOrCreateHandler: (threadId, agentId, accessToken) => {
    let handler = get().handlers.get(threadId);
    if (!handler) {
      // Create a new handler if one doesn't exist for the thread
      handler = new MessageHandler(threadId, agentId, accessToken);

      // --- Event Listener for incoming message chunks ---
      handler.on("messageChunk", (id, message) => {
        // Optimistically update the React Query cache for a smooth UI
        queryClient.setQueryData<InfiniteData<Message[]>>(
          [messageKey[EMessage.FETCH_ALL] + threadId],
          (prev) =>
            updateMessageInCache(prev, id, (msg) => (msg.message += message)),
        );
        // Also update the internal message state if needed elsewhere
        get().updateMessage(threadId, message, id);
      });

      // --- Event Listener for suggestions ---
      handler.on("suggestions", (_id, suggestions: Suggestion[]) => {
        // Changed to Suggestion[]
        get().updateSuggestions(threadId, suggestions);
      });

      // --- Event Listener for videos ---
      handler.on("suggestedVideos", (_id, videos: Video[]) => {
        // Changed to suggestedVideos and Video[]
        get().updateVideos(threadId, videos);
      });

      // --- Event Listener for status changes (e.g., 'loading', 'streaming', 'idle') ---
      handler.on("status", (status) => {
        get().updateStatus(threadId, status);
      });

      // --- Event Listener for when the entire stream is finished ---
      handler.on("streamConcluded", (_messageId, finalStreamData) => {
        const finalData: MessageInput = {
          thread_id: threadId,
          message: finalStreamData.message,
          sender: EnumSender.BOT,
          sources: finalStreamData.sources,
          flag: null,
        };

        // Add the completed stream to the global queue for processing
        set((state) => ({
          completedStreams: [
            ...state.completedStreams,
            {
              completionId: `${threadId}-${Date.now()}`, // Create a unique ID
              threadId: threadId,
              finalData: finalData,
            },
          ],
        }));

        console.log(
          `Stream done for thread ${threadId}. Added to completion queue.`,
        );
        get().updateStatus(threadId, "idle");
      });

      // Add the newly created handler to the store's state
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

  updateStatus: (threadId, status) => {
    set((state) => {
      const newStatuses = new Map(state.statuses);
      newStatuses.set(threadId, status);
      return { statuses: newStatuses };
    });
  },

  getStatus: (threadId) => {
    return get().statuses.get(threadId);
  },

  // --- Actions and Getters for Suggestions ---
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

  // --- Actions and Getters for Videos ---
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

  /**
   * Clears suggestions and videos for a given thread.
   */
  clearSuggestionsAndVideos: (threadId) => {
    set((state) => {
      const newSuggestions = new Map(state.suggestions);
      newSuggestions.delete(threadId);

      const newVideos = new Map(state.videos);
      newVideos.delete(threadId);

      return {
        suggestions: newSuggestions,
        videos: newVideos,
      };
    });
  },

  /**
   * Action to remove streams from the queue after they have been processed
   * by the GlobalStreamCompletionHandler.
   */
  processCompletedStreams: (completionIdsToRemove) => {
    set((state) => ({
      completedStreams: state.completedStreams.filter(
        (stream) => !completionIdsToRemove.includes(stream.completionId),
      ),
    }));
  },

  /**
   * Stops any active stream and cleans up all state associated with a threadId.
   */
  removeHandler: (threadId) => {
    set((state) => {
      const newHandlers = new Map(state.handlers);
      const handler = newHandlers.get(threadId);

      if (handler) {
        handler.stopStreaming(); // Ensure background processes are stopped
        newHandlers.delete(threadId);

        const newMessages = new Map(state.messages);
        newMessages.delete(threadId);

        const newStatuses = new Map(state.statuses);
        newStatuses.delete(threadId);

        const newSuggestions = new Map(state.suggestions); // Cleanup suggestions
        newSuggestions.delete(threadId);

        const newVideos = new Map(state.videos); // Cleanup videos
        newVideos.delete(threadId);

        // Note: We don't clean up 'completedStreams' here, as another thread might be
        // processing it. The 'processCompletedStreams' action is responsible for that.

        return {
          handlers: newHandlers,
          messages: newMessages,
          statuses: newStatuses,
          suggestions: newSuggestions,
          videos: newVideos,
        };
      }
      return state; // Return original state if no handler was found
    });
  },
}));

/**
 * A helper function to immutably update a specific message within the
 * deeply nested React Query cache structure for infinite queries.
 * @param prevData The previous cache data.
 * @param messageId The ID of the message to update.
 * @param updateFn A function that receives and modifies a draft of the message.
 * @returns The updated cache data.
 */
const updateMessageInCache = (
  prevData: InfiniteData<Message[]> | undefined,
  messageId: string,
  updateFn: (message: Message) => void,
): InfiniteData<Message[]> | undefined => {
  if (!prevData) return undefined;

  // Use map to create new arrays for pages and messages to ensure immutability
  const newData = {
    ...prevData,
    pages: prevData.pages.map((page) =>
      page.map((msg) => {
        if (msg.id === messageId) {
          // Create a new message object to avoid direct mutation
          const newMsg = { ...msg };
          updateFn(newMsg); // Apply the update
          return newMsg;
        }
        return msg;
      }),
    ),
  };
  return newData;
};
