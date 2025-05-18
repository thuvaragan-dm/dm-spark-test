import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EMessage, messageKey } from "./config";
import { Message, MessageParams } from "./types";

export const useGetMessages = (threadId: string, params?: MessageParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<Message[]>({
    queryKey: messageKey[EMessage.FETCH_ALL],
    apiClient,
    url: `/threads/${threadId}/messages`,
    errorMessage: "Failed to fetch messages.",
    queryOptions: {
      enabled: !!threadId,
    },
    queryParams: params,
  });
};
