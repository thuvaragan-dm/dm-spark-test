import { AnimatePresence, motion } from "motion/react";
import { ComponentProps } from "react";
import { VscComment, VscTasklist } from "react-icons/vsc";
import { useRerenderer } from "../../../../store/rerendererStore";
import ThreadButton from "./ThreadButton";
import { BinnedThreads } from "./binThreads";

interface IThreadsContainer extends ComponentProps<"div"> {
  threads: BinnedThreads;
}

const ThreadsContainer = ({ threads }: IThreadsContainer) => {
  const { rerenderThreadList } = useRerenderer();
  const { today, yesterday, lastWeek, last30Days, months } = threads;

  return (
    <div key={rerenderThreadList} className="relative w-full space-y-2">
      <div className="w-full">
        {today && today.length > 0 && (
          <>
            <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
              Today
            </p>

            <motion.div layout className="w-full space-y-1">
              {today.map((thread) => (
                <AnimatePresence key={thread.id} mode="popLayout">
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
                      key={thread.id}
                      name={thread.title}
                      to={`/home/chat?thread=${thread.id}`}
                    />
                  </motion.div>
                </AnimatePresence>
              ))}
            </motion.div>
          </>
        )}
      </div>

      <div className="w-full">
        {yesterday && yesterday.length > 0 && (
          <>
            <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
              Yesterday
            </p>

            <motion.div layout className="w-full space-y-1">
              {yesterday.map((thread) => (
                <AnimatePresence key={thread.id} mode="popLayout">
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
                      key={thread.id}
                      name={thread.title}
                      to={`/home/chat?thread=${thread.id}`}
                    />
                  </motion.div>
                </AnimatePresence>
              ))}
            </motion.div>
          </>
        )}
      </div>

      <div className="w-full">
        {lastWeek && lastWeek.length > 0 && (
          <>
            <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
              Last week
            </p>

            <motion.div layout className="w-full space-y-1">
              {lastWeek.map((thread) => (
                <AnimatePresence key={thread.id} mode="popLayout">
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
                      key={thread.id}
                      name={thread.title}
                      to={`/home/chat?thread=${thread.id}`}
                    />
                  </motion.div>
                </AnimatePresence>
              ))}
            </motion.div>
          </>
        )}
      </div>

      <div className="w-full">
        {last30Days && last30Days.length > 0 && (
          <>
            <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
              Last 30 days
            </p>

            <motion.div layout className="w-full space-y-1">
              {last30Days.map((thread) => (
                <AnimatePresence key={thread.id} mode="popLayout">
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
                      key={thread.id}
                      name={thread.title}
                      to={`/home/chat?thread=${thread.id}`}
                    />
                  </motion.div>
                </AnimatePresence>
              ))}
            </motion.div>
          </>
        )}
      </div>

      {Object.entries(months).map(([month, histories]) => (
        <div key={month} className="w-full">
          {month && histories.length > 0 && (
            <>
              <p className="dark:bg-primary-dark sticky top-0 z-10 -mx-3 min-w-0 shrink-0 overflow-hidden bg-white pt-2 pb-3 pl-3 text-[0.65rem] font-medium tracking-wider whitespace-nowrap text-gray-500/60 uppercase dark:text-white/60">
                {month}
              </p>

              <motion.div layout className="w-full space-y-1">
                {histories.map((thread) => (
                  <AnimatePresence key={thread.id} mode="popLayout">
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
                        key={thread.id}
                        name={thread.title}
                        to={`/home/chat?thread=${thread.id}`}
                      />
                    </motion.div>
                  </AnimatePresence>
                ))}
              </motion.div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThreadsContainer;
