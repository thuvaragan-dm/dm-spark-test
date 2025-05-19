import { cn } from "../../utilities/cn";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useContext, useEffect } from "react";
import { DropdownContext, DropdownMenuContext } from "./context";

interface IDropdownMenu extends RadixDropdownMenu.DropdownMenuContentProps {
  container?: Element | null | undefined;
}

const DropdownMenu = ({
  children,
  className,
  container,
  ...props
}: IDropdownMenu) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
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
    <DropdownMenuContext.Provider value={{ closeMenu }}>
      <AnimatePresence>
        {isOpen && (
          <RadixDropdownMenu.Portal
            container={container ?? document?.getElementById("menu-container")}
            forceMount
          >
            <RadixDropdownMenu.Content
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
            </RadixDropdownMenu.Content>
          </RadixDropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuContext.Provider>
  );
};

export default DropdownMenu;
