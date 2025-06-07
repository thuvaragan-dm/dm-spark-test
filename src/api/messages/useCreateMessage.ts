import { InfiniteData, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { nanoid } from "nanoid";
import { useApi } from "../../providers/ApiProvider";
import { MutationContext, useCreateMutation } from "../apiFactory";
import { Message, MessageInput, Sender } from "./types";

export const useCreateMessage = ({
  invalidateQueryKey,
  disableOptimistic = false,
  overrideSettled = true,
}: {
  invalidateQueryKey?: unknown[];
  disableOptimistic?: boolean;
  overrideSettled?: boolean;
}) => {
  const { apiClient } = useApi();

  const mutationOptions: Omit<
    UseMutationOptions<
      InfiniteData<Message[]>,
      AxiosError,
      { params?: Record<string, unknown>; body?: MessageInput }, // TVariables now has params and body
      MutationContext<InfiniteData<Message[]>>
    >,
    "mutationFn"
  > = {};

  if (overrideSettled) {
    mutationOptions.onSettled = () => {};
  }

  return useCreateMutation<
    Record<string, unknown>,
    MessageInput,
    Message,
    InfiniteData<Message[]>
  >({
    apiClient,
    method: "post",
    url: "/messages",
    errorMessage: "Failed to create a message.",
    invalidateQueryKey,
    mutationOptions: mutationOptions as any,
    optimisticUpdate: (oldMessages, variables) => {
      if (disableOptimistic) return oldMessages;
      if (oldMessages) {
        const newMessage: Message = {
          id: nanoid(10), // Generate a temporary ID for the optimistic update
          thread_id: variables.thread_id,
          message: variables.message,
          sender: variables.sender as Sender,
          flag: null,
          sources: [],
          reaction: null,
        };

        console.log({ newMessage });

        // Create a new copy of the data with the new message added
        const updated = {
          ...oldMessages,
          pages: [
            [newMessage], // Add the new message to the first page
            ...oldMessages.pages, // Keep the rest of the pages unchanged
          ],
        };

        return updated;
      }
      return oldMessages;
    },
  });
};
