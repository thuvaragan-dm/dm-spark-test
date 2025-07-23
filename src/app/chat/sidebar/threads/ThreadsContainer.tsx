import { AnimatePresence, motion } from "motion/react";
import { ComponentProps, memo } from "react";
import { VscComment, VscTasklist } from "react-icons/vsc";
import { Thread } from "../../../../api/thread/types";
import { useRerenderer } from "../../../../store/rerendererStore";
import { useStreamManager } from "../../../../store/streamStore";
import ThreadButton from "./ThreadButton";
import { BinnedThreads } from "./binThreads";

interface IThreadsContainer extends ComponentProps<"div"> {
  threads: BinnedThreads;
}

const TimePeriodSection = memo(
  ({ title, threads }: { title: string; threads: Thread[] }) => {
    if (!threads?.length) return null;

    return (
      <div className="w-full">
        <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
          {title}
        </p>
        <div className="w-full space-y-1">
          {threads.map((thread) => (
            <AnimatedThreadButton key={thread.id} thread={thread} />
          ))}
        </div>
      </div>
    );
  },
);

const AnimatedThreadButton = memo(({ thread }: { thread: Thread }) => {
  const streamedThreadName = useStreamManager((state) =>
    state.threadNames.get(thread.id),
  );

  const threadName = streamedThreadName || thread.title;

  return (
    <AnimatePresence
      key={thread.id + threadName}
      mode="popLayout"
      initial={false}
    >
      <motion.div
        layout
        initial={{ filter: "blur(10px)", opacity: 0, y: -10 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        exit={{ filter: "blur(10px)", opacity: 0, y: -10 }}
        transition={{ ease: "easeInOut" }}
      >
        <ThreadButton
          id={thread.id}
          Icon={() =>
            thread.has_task ? (
              <VscTasklist className="size-5 shrink-0 text-gray-600 dark:text-white/80" />
            ) : (
              <VscComment className="size-5 shrink-0 text-gray-600 dark:text-white/80" />
            )
          }
          name={threadName || thread.title}
          to={`/home/chat?thread=${thread.id}`}
        />
      </motion.div>
    </AnimatePresence>
  );
});

const ThreadsContainer = ({ threads }: IThreadsContainer) => {
  const { rerenderThreadList } = useRerenderer();
  const { today, yesterday, lastWeek, last30Days, months } = threads;

  return (
    <div key={rerenderThreadList} className="relative w-full space-y-2">
      <TimePeriodSection title="Today" threads={today} />
      <TimePeriodSection title="Yesterday" threads={yesterday} />
      <TimePeriodSection title="Last week" threads={lastWeek} />
      <TimePeriodSection title="Last 30 days" threads={last30Days} />

      {months &&
        Object.keys(months).map((month) => (
          <TimePeriodSection
            key={month}
            title={month}
            threads={months[month]}
          />
        ))}
    </div>
  );
};

export default memo(ThreadsContainer);
