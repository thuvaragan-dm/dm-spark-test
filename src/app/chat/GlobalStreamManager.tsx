import { useEffect } from "react";
import { useStreamStore } from "../../store/streamStore";
import { useCreateMessage } from "../../api/messages/useCreateMessage";
import { EnumSender } from "../../api/messages/types";
import { messageKey, EMessage } from "../../api/messages/config";
import queryClient from "../../api/queryClient";

/**
 * This is a headless component that should be mounted at the top level of the app.
 * Its sole purpose is to listen to 'streamConcluded' events from all active handlers
 * in the global store and trigger the final API call to save the message.
 */
const GlobalStreamManager = () => {
  const handlers = useStreamStore((state) => state.handlers);

  // Get the mutation function from the react-query hook.
  // We will handle invalidation manually in the `onSuccess` callback
  // to ensure it targets the correct thread.
  const { mutate: createMessage } = useCreateMessage({
    disableOptimistic: true,
  });

  useEffect(() => {
    const subscriptions: (() => void)[] = [];

    // Iterate over all active handlers in the Zustand store
    handlers.forEach((handler, threadId) => {
      // Subscribe to the 'streamConcluded' event for each handler.
      // Your MessageHandler class should emit this event when a stream finishes.
      const unsubscribe = handler.on(
        "streamConcluded",
        (_botMessageId, finalData, reason) => {
          // Only save the message if the stream completed successfully.
          // This prevents saving messages from streams that were interrupted or errored out.
          if (reason === "completed") {
            console.log(
              `[GlobalStreamManager] Stream for thread ${threadId} completed. Saving final message.`,
            );

            // Trigger the createMessage mutation to persist the bot's response.
            createMessage(
              {
                body: {
                  thread_id: threadId,
                  message: finalData.message,
                  sender: EnumSender.BOT,
                  sources: finalData.sources,
                  flag: null,
                  // Add any other fields from finalData that need to be saved
                },
              },
              {
                onSuccess: () => {
                  console.log(
                    `[GlobalStreamManager] Message for thread ${threadId} saved successfully. Invalidating cache.`,
                  );
                  // After successfully saving, invalidate the query for this specific thread.
                  // This tells React Query to refetch the messages, ensuring the UI
                  // displays the final, persisted data from the server.
                  queryClient.invalidateQueries({
                    queryKey: [messageKey[EMessage.FETCH_ALL] + threadId],
                  });
                },
                onError: (error) => {
                  console.error(
                    `[GlobalStreamManager] Failed to save final message for thread ${threadId}:`,
                    error,
                  );
                },
              },
            );
          } else {
            console.log(
              `[GlobalStreamManager] Stream for thread ${threadId} ended with reason: '${reason}'. Final message not saved.`,
            );
          }
        },
      );
      subscriptions.push(unsubscribe);
    });

    // Cleanup function:
    // When the component unmounts or the `handlers` map changes,
    // remove all of the current subscriptions to prevent memory leaks.
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [handlers, createMessage]);

  return null; // This component does not render any UI elements.
};

export default GlobalStreamManager;
