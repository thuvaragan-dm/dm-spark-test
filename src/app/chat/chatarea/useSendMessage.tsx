import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InfiniteData } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useAgent } from "../../../store/agentStore";
import { useCreateThread } from "../../../api/thread/useCreateThread";
import { EThread, threadKey } from "../../../api/thread/config";
import { useCreateMessage } from "../../../api/messages/useCreateMessage";
import { EMessage, messageKey } from "../../../api/messages/config";
import { EnumSender, Message, MessageInput } from "../../../api/messages/types";
import queryClient from "../../../api/queryClient";

/**
 * A hook to manage the entire process of sending a user's message.
 * It handles new thread creation, saving the user's message,
 * and initiating the bot's streaming response.
 */
export const useSendMessage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedAgent } = useAgent();
  const currentThreadId = searchParams.get("thread");

  // This new state will provide a manual loading indicator for the pre-stream setup.
  const [isPreparing, setIsPreparing] = useState(false);

  const { mutateAsync: createThread } = useCreateThread({
    invalidateQueryKey: [threadKey[EThread.ALL]],
  });

  const { mutateAsync: createMessage } = useCreateMessage({
    invalidateQueryKey: currentThreadId
      ? [messageKey[EMessage.FETCH_ALL] + currentThreadId]
      : undefined,
  });

  /**
   * Orchestrates the process of sending a message.
   * @param messageText The text of the user's message.
   * @param startStreamCallback A function from `useChatStream` to begin the bot's response stream.
   */
  const sendMessage = async (
    messageText: string,
    startStreamCallback: (
      userQuery: string,
      botMessageId: string,
      files?: File[],
      options?: { threadId?: string },
    ) => void,
  ) => {
    if (!selectedAgent) {
      console.error("Cannot send message: No agent selected.");
      return;
    }

    // --- Start loading state ---
    setIsPreparing(true);
    let threadIdToUse = currentThreadId;

    try {
      // Step 1: If there's no thread, create one first.
      if (!threadIdToUse) {
        const newThread = await createThread({
          body: {
            copilot_id: selectedAgent.id,
            title: messageText.substring(0, 50), // Use first 50 chars as title
          },
        });
        threadIdToUse = newThread.id;
        setSearchParams({ thread: newThread.id });
      }

      if (!threadIdToUse) {
        throw new Error("Failed to obtain a thread ID.");
      }

      // Step 2: Send the user's message to the backend.
      const userMessageInput: MessageInput = {
        message: messageText,
        sender: EnumSender.USER,
        thread_id: threadIdToUse,
        flag: null,
        sources: [],
      };
      await createMessage({ body: userMessageInput });

      // Step 3: Optimistically create a placeholder for the bot's response.
      const botPlaceholderId = nanoid(12);
      const queryKey = [messageKey[EMessage.FETCH_ALL] + threadIdToUse];
      const botPlaceholder: Message = {
        id: botPlaceholderId,
        thread_id: threadIdToUse,
        message: "",
        sender: EnumSender.BOT,
        sources: [],
        flag: null,
        reaction: null,
      };
      queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
        if (!oldData) {
          return { pages: [[botPlaceholder]], pageParams: [undefined] };
        }
        return { ...oldData, pages: [[botPlaceholder], ...oldData.pages] };
      });

      // Step 4: Trigger the bot's stream.
      // The loading state will be turned off in the `finally` block right after this.
      startStreamCallback(messageText, botPlaceholderId, [], {
        threadId: threadIdToUse,
      });
    } catch (error) {
      console.error("An error occurred while sending the message:", error);
    } finally {
      // --- Stop loading state ---
      // This block executes after the try/catch, ensuring the loading state
      // is always reset before the function exits.
      setTimeout(() => {
        setIsPreparing(false);
      }, 500);
    }
  };

  // Return the new manual loading state instead of the derived one.
  return { sendMessage, isPreparing };
};
