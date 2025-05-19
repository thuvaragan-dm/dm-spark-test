import { cn } from "../../utilities/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useContext, useEffect, useState } from "react";
import { DialogContext } from "./context";
import DialogOverlay from "./DialogOverlay";

type DialogContentRef = React.ComponentRef<typeof DialogPrimitive.Content>;
type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  contentContainerClassName?: string;
};

const DialogContent = forwardRef<DialogContentRef, DialogContentProps>(
  ({ className, children, contentContainerClassName, ...props }, ref) => {
    const { isOpen, hideOverlay } = useContext(DialogContext);
    const [doc, setDoc] = useState<Document | undefined>(undefined);
    useEffect(() => {
      if (window) {
        setDoc(window.document);
      }
    }, []);

    return (
      <DialogPrimitive.Portal
        container={doc?.getElementById("modal-container")}
        forceMount
      >
        <>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial="closed" animate="open" exit="closed">
                {!hideOverlay && (
                  <DialogOverlay asChild>
                    <motion.div
                      variants={{
                        closed: { opacity: 0, transition: { duration: 0.2 } },
                        open: { opacity: 1, transition: { duration: 0.3 } },
                      }}
                      transition={{ ease: "circInOut" }}
                    ></motion.div>
                  </DialogOverlay>
                )}

                <motion.div
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className={cn(
                    `fixed inset-0 z-[999] flex items-center justify-center`,
                    contentContainerClassName,
                  )}
                >
                  <DialogPrimitive.Content
                    ref={ref}
                    {...props}
                    className={cn(className)}
                    asChild
                  >
                    <motion.div
                      variants={{
                        closed: {
                          y: 2,
                          opacity: 0,
                          scale: 0.97,
                          transition: { duration: 0.15 },
                        },
                        open: {
                          y: 0,
                          opacity: 1,
                          scale: 1,
                          transition: { duration: 0.3 },
                        },
                      }}
                      transition={{ ease: "easeInOut" }}
                      className="overflow-hidden focus:outline-none sm:max-h-[90dvh]"
                    >
                      {children}
                    </motion.div>
                  </DialogPrimitive.Content>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </DialogPrimitive.Portal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export default DialogContent;
