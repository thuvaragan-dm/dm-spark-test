"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EMessage, messageKey } from "../../../api/messages/config";
import { EnumSender } from "../../../api/messages/types";
import { useCreateMessage } from "../../../api/messages/useCreateMessage";
import { EThread, threadKey } from "../../../api/thread/config";
import { useCreateThread } from "../../../api/thread/useCreateThread";
import useAppendToSearchQuery from "../../../hooks/useAppendToSearchQuery";
import { useAgent } from "../../../store/agentStore";

const useSendMessage = () => {
  const [searchParams] = useSearchParams();
  const appendToSearchQuery = useAppendToSearchQuery();
  const { selectedAgent } = useAgent();

  const threadId = useMemo(
    () => searchParams.get("thread") || null,
    [searchParams],
  );

  const [isSendMessageLoading, setIsSendMessageLoading] = useState(false);

  const { mutateAsync: createThread } = useCreateThread({
    invalidateQueryKey: [threadKey[EThread.ALL]],
  });

  const { mutate: createMessage } = useCreateMessage({
    invalidateQueryKey: [messageKey[EMessage.FETCH_ALL] + threadId || ""],
  });

  const sendMessage = useCallback(
    async (message: string) => {
      try {
        setIsSendMessageLoading(true);
        let computedThreadId: string = threadId || "";

        if (selectedAgent) {
          if (!threadId) {
            const thread = await createThread({
              body: {
                copilot_id: selectedAgent.id,
                title: "New chat",
              },
            });

            if (thread) {
              appendToSearchQuery({ thread: thread.id });
              computedThreadId = thread.id;
            }
          }

          createMessage({
            body: {
              message,
              sender: EnumSender.USER,
              thread_id: computedThreadId,
              flag: null,
              sources: [],
            },
          });
        }
      } catch (error) {
        console.log({ error });
      } finally {
        setIsSendMessageLoading(false);
      }
    },
    [selectedAgent, threadId, appendToSearchQuery, createThread, createMessage],
  );

  return { sendMessage, isSendMessageLoading };
};

export default useSendMessage;
