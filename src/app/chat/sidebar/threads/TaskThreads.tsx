import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import {
  EThread,
  THREAD_LIMIT,
  threadKey,
} from "../../../../api/thread/config";
import { useGetThreads } from "../../../../api/thread/useGetThreads";
import Spinner from "../../../../components/Spinner";
import { useAgent } from "../../../../store/agentStore";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Loading from "./Loading";
import ThreadsContainer from "./ThreadsContainer";
import { binThreads } from "./binThreads";

const TaskThreads = () => {
  // Fetch threads and handle state
  const { selectedAgent } = useAgent();

  const {
    data: taskThreads,
    fetchNextPage,
    isPending: isThreadsLoading,
    isFetchingNextPage,
    error,
    refetch,
  } = useGetThreads({
    queryKey: threadKey[EThread.TASK],
    params: {
      limit: THREAD_LIMIT,
      copilot_id: selectedAgent ? selectedAgent.id : undefined,
      has_task: true,
    },
  });

  // Bin threads for better organization
  const threads = useMemo(() => {
    const flatThreads = taskThreads?.pages.flat() ?? [];
    return binThreads(flatThreads);
  }, [taskThreads]);

  // Set up infinite scrolling
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  // Handle different states
  if (error) return <ErrorState retry={() => refetch()} />;
  if (isThreadsLoading) return <Loading />;

  return (
    <div className="flex h-full flex-1 flex-col">
      {taskThreads?.pages.flat(2)?.length > 0 ? (
        <ThreadsContainer threads={threads} />
      ) : (
        <EmptyState />
      )}

      <div className="h-1 pb-5" ref={ref}>
        <AnimatePresence mode="popLayout">
          {isFetchingNextPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full items-center justify-center"
            >
              <Spinner className="size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskThreads;
