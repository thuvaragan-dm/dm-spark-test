import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";
import { ISidebarWrapper } from ".";
import { useSidebar, useSidebarActions } from "../../../../store/sidebarStore";
import { cn } from "../../../../utilities/cn";

const MobileSidebarWrapper = ({
  children,
  className,
  ...rest
}: ISidebarWrapper) => {
  const { isSidebarVisible } = useSidebar();
  const { setIsSidebarVisible } = useSidebarActions();

  const sidebarVisibilityAnimationContoler = useAnimationControls();

  useEffect(() => {
    if (isSidebarVisible) {
      sidebarVisibilityAnimationContoler.start("visible");
    } else {
      sidebarVisibilityAnimationContoler.start("hidden");
    }
  }, [isSidebarVisible, sidebarVisibilityAnimationContoler]);

  return (
    <>
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.aside
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {
                x: "-100%",
                transition: {
                  duration: 0.5,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
              visible: {
                x: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
            }}
            className={cn(
              "bg-primary-dark fixed inset-0 left-0 isolate z-[99999] flex h-full w-72 shrink-0 flex-col shadow-xl md:hidden",
              className,
            )}
            {...rest}
          >
            {children}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* backdrop */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {
                opacity: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
            }}
            onClick={() => setIsSidebarVisible((pv) => !pv)}
            className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm md:hidden"
          ></motion.div>
        )}
      </AnimatePresence>
      {/* backdrop */}
    </>
  );
};

export default MobileSidebarWrapper;
