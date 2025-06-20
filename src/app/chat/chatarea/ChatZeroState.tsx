import { AnimatePresence, motion } from "motion/react";
import icon from "../../../assets/icon.png";
import Spinner from "../../../components/Spinner";

const ChatZeroState = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-30 flex w-full flex-col items-center-safe justify-center-safe overflow-hidden"
    >
      <div className="aspect-square w-min rounded-full bg-white/10 p-2 text-white">
        <img src={icon} alt="Spark Logo" className="size-20 object-cover" />
      </div>

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
