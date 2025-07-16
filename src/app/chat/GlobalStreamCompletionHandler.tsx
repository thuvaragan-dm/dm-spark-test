import { useEffect, useMemo } from "react";
import { EMessage, messageKey } from "../../api/messages/config";
import { useCreateMessage } from "../../api/messages/useCreateMessage";
import queryClient from "../../api/queryClient";
import { useStreamManager } from "../../store/streamStore";
import { EThread, THREAD_LIMIT, threadKey } from "../../api/thread/config";
import { useAgent } from "../../store/agentStore";
import { ThreadParams } from "../../api/thread/types";
import { useRerendererActions } from "../../store/rerendererStore";

/**
 * A headless component that listens for concluded streams globally
 * and saves the final message to the database via a mutation.
 * It should be placed once in a top-level layout component.
 */
export const GlobalStreamCompletionHandler = () => {
  const { selectedAgent } = useAgent();
  const { setRerenderThreadList } = useRerendererActions();

  const agentOptions = useMemo<ThreadParams>(() => {
    return {
      limit: THREAD_LIMIT,
      copilot_id: selectedAgent ? selectedAgent.id : undefined,
    };
  }, [selectedAgent]);
  // 1. Subscribe to the list of completed streams and the action to clear them.
  const { completedStreams, processCompletedStreams } = useStreamManager();

  // 2. Get the `mutate` function from your create message hook.
  // We don't provide static options here because each mutation will have
  // its own dynamic `onSuccess` callback.
  const { mutate: createMessage } = useCreateMessage({
    disableOptimistic: true,
    invalidateQueryKey: [],
    overrideSettled: true,
  });

  // 3. Use an effect to react whenever the list of completed streams changes.
  useEffect(() => {
    // If there are no streams in the queue to process, do nothing.
    if (completedStreams.length === 0) {
      return;
    }

    console.log(`Processing ${completedStreams.length} completed stream(s).`);

    const processedIds: string[] = [];

    // Iterate over all streams currently in the completion queue.
    completedStreams.forEach((stream) => {
      // Add the stream's unique ID to our list of processed items.
      processedIds.push(stream.completionId);

      // Fire the mutation to save the final message data.
      createMessage(
        { body: stream.finalData },
        {
          // Provide dynamic callbacks for this specific mutation instance.
          onSuccess: () => {
            console.log(
              `Successfully saved bot message for thread ${stream.threadId}`,
            );
            // On success, invalidate the query for the specific thread that was updated.
            // This ensures the UI for that chat fetches the latest data, confirming the save.
            queryClient.invalidateQueries({
              queryKey: [messageKey[EMessage.FETCH_ALL] + stream.threadId],
            });
            queryClient.invalidateQueries({
              queryKey: [threadKey[EThread.ALL], agentOptions],
            });

            setTimeout(() => {
              setRerenderThreadList((prev) => prev + 1);
            }, 500);
          },
          onError: (error) => {
            console.error(
              `Failed to save bot message for thread ${stream.threadId}:`,
              error,
            );
            // You could add more robust error handling here, like sending to a logging service.
          },
        },
      );
    });

    // 4. After firing all mutations, clear the processed items from the store's queue.
    // This is critical to prevent processing the same stream more than once.
    if (processedIds.length > 0) {
      processCompletedStreams(processedIds);
    }
  }, [
    completedStreams,
    createMessage,
    processCompletedStreams,
    agentOptions,
    setRerenderThreadList,
  ]);

  // This component renders nothing in the DOM.
  return null;
};
