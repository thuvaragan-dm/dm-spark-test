import { InfiniteData } from "@tanstack/react-query";
import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Message, ReactionInput } from "./types";

export const useAddMessageReaction = ({
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
    method: "post",
    url: "/messages/${id}/reactions",
    errorMessage: "Failed to add reaction.",
    invalidateQueryKey,
    optimisticUpdate: (oldMessages, variables, params) => {
      if (oldMessages && params) {
        const shallowOldMessages = JSON.parse(
          JSON.stringify(oldMessages)
        ) as InfiniteData<Message[]>;
        const updatedPages = shallowOldMessages.pages.map((page) => {
          page.map((message) => {
            if (message.id === params.id) {
              message.reaction = variables.reaction_type;
            }
            return message;
          });
          return page;
        });

        return { ...oldMessages, pages: updatedPages };
      }
      return oldMessages;
    },
  });
};
