import { InfiniteData } from "@tanstack/react-query";
import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Message, ReactionInput } from "./types";

export const useRemoveMessageReaction = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    ReactionInput,
    Message,
    InfiniteData<Message[]>
  >({
    apiClient,
    method: "delete",
    url: "/messages/${id}/reactions",
    errorMessage: "Failed to remove reaction.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (oldMessages, _, params) => {
      if (oldMessages && params) {
        const shallowOldMessages = JSON.parse(
          JSON.stringify(oldMessages)
        ) as InfiniteData<Message[]>;
        const udpatedPages = shallowOldMessages.pages.map((page) => {
          page.map((message) => {
            if (message.id === params.id) {
              message.reaction = null;
            }
            return message;
          });
          return page;
        });

        return { ...oldMessages, pages: udpatedPages };
      }
      return oldMessages;
    },
  });
};
