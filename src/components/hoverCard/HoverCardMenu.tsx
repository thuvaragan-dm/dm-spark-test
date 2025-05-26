import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useContext, useEffect } from "react";
import { HoverCardContext, HoverCardMenuContext } from "./context";
import { cn } from "../../utilities/cn";

interface IHoverCardMenu extends RadixHoverCard.HoverCardContentProps {
  container?: Element | null | undefined;
}

const HoverCardMenu = ({
  children,
  className,
  container,
  ...props
}: IHoverCardMenu) => {
  const { isOpen, setIsOpen } = useContext(HoverCardContext);
  const animationController = useAnimationControls();

  const closeMenu = async () => {
    await animationController.start("close");
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      animationController.start("open");
    }
  }, [isOpen, animationController]);

  return (
    <HoverCardMenuContext.Provider value={{ closeMenu }}>
      <AnimatePresence>
        {isOpen && (
          <RadixHoverCard.Portal
            container={
              container ?? document?.getElementById("hover-card-container")
            }
            forceMount
          >
            <RadixHoverCard.Content
              align="end"
              className={cn(
                "mt-1 w-full overflow-hidden rounded bg-white/75 p-2 text-left shadow backdrop-blur",
                className,
              )}
              asChild
              {...props}
            >
              <motion.div
                animate={animationController}
                exit="close"
                variants={{
                  open: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { duration: 0.1 },
                  },
                  close: {
                    opacity: 0,
                    scale: 0.98,
                    y: -5,
                    transition: { duration: 0.3 },
                  },
                }}
              >
                {children}
              </motion.div>
            </RadixHoverCard.Content>
          </RadixHoverCard.Portal>
        )}
      </AnimatePresence>
    </HoverCardMenuContext.Provider>
  );
};

export default HoverCardMenu;
