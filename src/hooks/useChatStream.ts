import { InfiniteData } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { EMessage, messageKey } from "../api/messages/config";
import { Message, Source } from "../api/messages/types";
import queryClient from "../api/queryClient";
import { StreamStatus } from "../app/chat/chatarea/MessageHandler";
import { useAuth } from "../store/authStore";
import { useStreamStore } from "../store/streamStore";

/**
 * A hook that provides a view into the streaming state for a specific chat thread.
 * It connects to the global stream manager and updates the UI and React Query cache
 * in real-time for the currently focused thread.
 *
 * @param threadId The ID of the thread to connect to from the component's props/URL.
 * @param agentId The ID of the currently selected agent.
 * @returns An object with stream status and functions to control the stream.
 */
export const useChatStream = ({
  threadId: currentThreadId, // Renamed for clarity within the hook
  agentId,
}: {
  threadId: string | null; // Can be null if no thread is selected
  agentId: string | null;
}) => {
  const { accessToken } = useAuth();
  const getOrCreateHandler = useStreamStore(
    (state) => state.getOrCreateHandler,
  );

  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");
  const isStreaming =
    streamStatus === "streaming" || streamStatus === "loading";

  // This effect is the core of the hook. It subscribes to events for the
  // currently focused thread and cleans up the subscriptions when the thread changes.
  useEffect(() => {
    // Do nothing if we don't have the necessary information.
    if (!currentThreadId || !agentId || !accessToken) {
      setStreamStatus("idle");
      return;
    }

    const handler = getOrCreateHandler(currentThreadId, agentId, accessToken);

    // Immediately sync the component's state with the handler's current state.
    setStreamStatus(handler.getCurrentStreamStatus());

    // Define the listener functions that will update our state and the React Query cache.
    const handleStatusChange = (status: StreamStatus) => {
      setStreamStatus(status);
    };

    const handleMessageChunk = (botMessageId: string, chunk: string) => {
      queryClient.setQueryData<InfiniteData<Message[]>>(
        [messageKey[EMessage.FETCH_ALL] + currentThreadId],
        (prev) =>
          updateMessageInCache(prev, botMessageId, (msg) => {
            msg.message += chunk;
          }),
      );
    };

    const handleSources = (botMessageId: string, sources: Source[]) => {
      queryClient.setQueryData<InfiniteData<Message[]>>(
        [messageKey[EMessage.FETCH_ALL] + currentThreadId],
        (prev) =>
          updateMessageInCache(prev, botMessageId, (msg) => {
            msg.sources = sources;
          }),
      );
    };

    // Subscribe to the events on the specific handler for this thread.
    const unsubStatus = handler.on("status", handleStatusChange);
    const unsubChunk = handler.on("messageChunk", handleMessageChunk);
    const unsubSources = handler.on("sources", handleSources);

    // Return a cleanup function to unsubscribe from all events.
    return () => {
      unsubStatus();
      unsubChunk();
      unsubSources();
    };
  }, [currentThreadId, agentId, accessToken, getOrCreateHandler]);

  /**
   * Starts a stream.
   * This can be for the current thread context or for a new one by passing it in the options.
   * @param userQuery The user's message to send.
   * @param botMessageId The temporary client-side ID for the bot's response message.
   * @param files Optional array of files to include.
   * @param options Optional object to override hook props, e.g., for providing a new threadId.
   */
  const startStream = useCallback(
    (
      userQuery: string,
      botMessageId: string,
      files?: File[],
      options?: { threadId?: string },
    ) => {
      // Prioritize the threadId from options, otherwise use the one from props.
      const threadIdToUse = options?.threadId || currentThreadId;

      if (!threadIdToUse || !agentId || !accessToken) {
        console.error(
          "Cannot start stream: missing threadId, agentId, or token.",
        );
        return;
      }
      const handler = getOrCreateHandler(threadIdToUse, agentId, accessToken);
      handler.startStreaming(userQuery, botMessageId, files);
    },
    [currentThreadId, agentId, accessToken, getOrCreateHandler],
  );

  /**
   * Interrupts the stream for the current thread associated with the hook.
   */
  const interruptStream = useCallback(() => {
    if (currentThreadId && agentId && accessToken) {
      const handler = getOrCreateHandler(currentThreadId, agentId, accessToken);
      handler.stopStreaming();
    }
  }, [currentThreadId, agentId, accessToken, getOrCreateHandler]);

  return { streamStatus, isStreaming, startStream, interruptStream };
};

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
          const newMsg = { ...msg }; // Shallow copy the message to update
          updateFn(newMsg); // Apply the update mutation
          return newMsg;
        }
        return msg;
      }),
    ),
  };
  return newData;
};
