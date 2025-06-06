import { create } from "zustand";
import { MessageHandler } from "../app/chat/chatarea/MessageHandler"; // Adjust path as necessary

interface StreamManagerState {
  handlers: Map<string, MessageHandler>;
  getHandler: (threadId: string) => MessageHandler | undefined;
  getOrCreateHandler: (
    threadId: string,
    agentId: string,
    accessToken: string,
  ) => MessageHandler;
  removeHandler: (threadId: string) => void;
}

export const useStreamStore = create<StreamManagerState>()((set, get) => ({
  /**
   * A map holding all active MessageHandler instances, keyed by their threadId.
   */
  handlers: new Map(),

  /**
   * Retrieves an existing handler for a given threadId, if one exists.
   * @param threadId The ID of the thread.
   * @returns The MessageHandler instance or undefined.
   */
  getHandler: (threadId: string) => {
    return get().handlers.get(threadId);
  },

  /**
   * Retrieves an existing MessageHandler for a threadId or creates a new one
   * if it doesn't exist. This is the primary method components should use
   * to interact with a stream.
   * @param threadId The ID of the thread.
   * @param agentId The ID of the copilot/agent.
   * @param accessToken The user's authentication token.
   * @returns A MessageHandler instance for the given thread.
   */
  getOrCreateHandler: (threadId, agentId, accessToken) => {
    const existingHandler = get().handlers.get(threadId);
    if (existingHandler) {
      return existingHandler;
    }

    // If no handler exists, create and register a new one.
    const newHandler = new MessageHandler(threadId, agentId, accessToken);

    set((state) => {
      const newHandlers = new Map(state.handlers);
      newHandlers.set(threadId, newHandler);
      return { handlers: newHandlers };
    });

    return newHandler;
  },

  /**
   * Removes a handler from the store. This can be used for explicit cleanup
   * if a thread is deleted or a stream is irrevocably terminated.
   * @param threadId The ID of the thread handler to remove.
   */
  removeHandler: (threadId: string) => {
    set((state) => {
      const newHandlers = new Map(state.handlers);
      const handler = newHandlers.get(threadId);
      if (handler) {
        // Optional: Ensure any active connection is stopped before deleting.
        handler.stopStreaming();
        newHandlers.delete(threadId);
      }
      return { handlers: newHandlers };
    });
  },
}));

// Optional: Exporting custom hooks for easier consumption can be cleaner.
export const useStreamManager = () => useStreamStore((state) => state);
