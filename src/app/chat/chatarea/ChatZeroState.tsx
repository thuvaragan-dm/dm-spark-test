import { AnimatePresence, motion } from "motion/react";
import { useAgent } from "../../../store/agentStore";
import Avatar from "../../../components/Avatar";
import Spinner from "../../../components/Spinner";

const ChatZeroState = ({ isLoading }: { isLoading: boolean }) => {
  const { selectedAgent } = useAgent();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-30 flex w-full flex-col items-center-safe justify-center-safe"
    >
      {selectedAgent && (
        <div className="bg-secondary size-16 shrink-0 rounded-full">
          <Avatar
            Fallback={() => (
              <Avatar.Fallback className="bg-secondary size-16 text-xs">
                {selectedAgent.name[0]} {selectedAgent.name[1]}
              </Avatar.Fallback>
            )}
            className="dark:ring-primary-dark-foreground relative z-10 flex aspect-square size-16 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-full object-cover p-0 shadow-inner ring-2 ring-white md:p-0"
            src={selectedAgent.avatar || ""}
          />
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-center text-lg font-light text-gray-600 dark:text-white/60">
          Good to see you!
        </h3>
        <h1 className="text-center text-xl text-gray-800 dark:text-white">
          How can i be an Assistance?
        </h1>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-center justify-center gap-3"
          >
            <Spinner className="size-4 dark:text-white/60" />
            <p className="shrink-0 text-xs text-gray-600 dark:text-white/60">
              Please wait till I create a thread for you.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatZeroState;
