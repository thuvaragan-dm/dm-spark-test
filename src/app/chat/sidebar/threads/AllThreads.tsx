import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import {
  EThread,
  THREAD_LIMIT,
  threadKey,
} from "../../../../api/thread/config";
import { ThreadParams } from "../../../../api/thread/types";
import { useGetThreads } from "../../../../api/thread/useGetThreads";
import Spinner from "../../../../components/Spinner";
import { useAgent } from "../../../../store/agentStore";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Loading from "./Loading";
import ThreadsContainer from "./ThreadsContainer";
import { binThreads } from "./binThreads";

const AllThreads = () => {
  const { selectedAgent } = useAgent();

  const agentOptions = useMemo<ThreadParams>(
    () => ({
      limit: THREAD_LIMIT,
      copilot_id: selectedAgent?.id,
    }),
    [selectedAgent],
  );

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

  // Memoize thread data processing
  const flatThreads = useMemo(
    () => allThreads?.pages.flat() ?? [],
    [allThreads],
  );
  const threads = useMemo(() => binThreads(flatThreads), [flatThreads]);
  const hasThreads = flatThreads.length > 0;

  // Infinite scroll
  const { ref, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, isFetchingNextPage]);

  // Handle states
  if (error) return <ErrorState retry={() => refetch()} />;
  if (isThreadsLoading && !allThreads) return <Loading />;

  return (
    <div className="flex h-full flex-1 flex-col">
      {hasThreads ? <ThreadsContainer threads={threads} /> : <EmptyState />}

      <div className="h-1 pb-5" ref={ref}>
        {isFetchingNextPage && (
          <div className="flex w-full items-center justify-center">
            <Spinner className="size-5 dark:text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AllThreads;
