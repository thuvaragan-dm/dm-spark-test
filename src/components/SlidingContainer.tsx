"use client";
import { AnimatePresence, motion, MotionConfig, Variants } from "motion/react";
import { ComponentProps } from "react";
import useMeasure from "react-use-measure";
import useGetPreviousState from "../hooks/useGetPreviousState";
import { cn } from "../utilities/cn";

interface ISlidingContainer extends ComponentProps<"div"> {
  active: number;
  wrapperClass?: string;
}

const SlidingContainer = ({
  active,
  children,
  className,
  wrapperClass,
}: ISlidingContainer) => {
  const prev = useGetPreviousState(active);
  const direction: 1 | -1 = prev && prev < active ? 1 : -1;
  const [containerRef, { width }] = useMeasure();

  const variants: Variants = {
    initial: (direction) => ({
      x: direction * width,
    }),
    animate: {
      x: 0,
    },
    exit: (direction) => ({
      x: direction * -width,
    }),
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full flex-1 overflow-x-hidden overflow-y-auto",
        wrapperClass,
      )}
    >
      <MotionConfig transition={{ type: "spring", damping: 15 }}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={active}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={direction}
            className={cn(
              "scrollbar h-full w-full flex-1 overflow-y-auto",
              className,
            )}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
};

export default SlidingContainer;
