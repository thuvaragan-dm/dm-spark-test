import { motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";
import { useSidebar } from "../../../../store/sidebarStore";
import { cn } from "../../../../utilities/cn";
import { ISidebarWrapper } from ".";

const DesktopSidebarWrapper = ({
  children,
  className,
  ...rest
}: ISidebarWrapper) => {
  const { isSidebarExpanded } = useSidebar();

  const sidebarExpansionAnimationControler = useAnimationControls();

  useEffect(() => {
    if (isSidebarExpanded) {
      sidebarExpansionAnimationControler.start("expand");
    } else {
      sidebarExpansionAnimationControler.start("contract");
    }
  }, [isSidebarExpanded, sidebarExpansionAnimationControler]);

  return (
    <motion.aside
      initial="expand"
      animate={sidebarExpansionAnimationControler}
      variants={{
        expand: {
          width: "var(--expanded-width,18rem)",
          transition: {
            duration: 0.5,
            ease: [0.36, 0.66, 0.04, 1],
          },
        },
        contract: {
          width: "var(--contracted-width,0rem)",
          transition: {
            duration: 0.5,
            ease: [0.36, 0.66, 0.04, 1],
          },
        },
      }}
      className={cn(
        "@container fixed inset-0 left-0 hidden h-full shrink-0 flex-col overflow-hidden md:relative md:flex",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.aside>
  );
};

export default DesktopSidebarWrapper;
