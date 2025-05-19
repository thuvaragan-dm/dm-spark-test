import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Loading from "./Loading";
import ThreadsContainer from "./ThreadsContainer";
import { binThreads } from "./binThreads";
import { useAgent } from "../../../../store/agentStore";
import { ThreadParams } from "../../../../api/thread/types";
import {
  EThread,
  THREAD_LIMIT,
  threadKey,
} from "../../../../api/thread/config";
import { useGetThreads } from "../../../../api/thread/useGetThreads";
import Spinner from "../../../../components/Spinner";

const AllThreads = () => {
  // Fetch threads and handle state
  const { selectedAgent } = useAgent();

  const agentOptions = useMemo<ThreadParams>(() => {
    return {
      limit: THREAD_LIMIT,
      copilot_id: selectedAgent ? selectedAgent.id : undefined,
    };
  }, [selectedAgent]);

  const {
    data: allThreads,
    fetchNextPage,
    isPending: isThreadsLoading,
    isFetchingNextPage,
    error,
    refetch,
  } = useGetThreads({
    queryKey: threadKey[EThread.ALL],
    params: agentOptions,
  });

  // Bin threads for better organization
  const threads = useMemo(() => {
    const flatThreads = allThreads?.pages.flat() ?? [];
    return binThreads(flatThreads);
  }, [allThreads]);

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
      {allThreads?.pages.flat(2)?.length > 0 ? (
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
              <Spinner className="size-5 dark:text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AllThreads;
