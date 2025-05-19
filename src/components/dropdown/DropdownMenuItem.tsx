import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, useAnimationControls } from "motion/react";
import { useContext } from "react";
import { cn } from "../../utilities/cn";
import sleep from "../../utilities/sleep";
import { DropdownMenuContext } from "./context";

interface IDropdownItem extends RadixDropdownMenu.DropdownMenuItemProps {
  color?: string;
  highlightColor?: string;
}

const DropdownMenuItem = ({
  children,
  onSelect,
  className,
  color,
  highlightColor: highlightColor,
}: IDropdownItem) => {
  const { closeMenu } = useContext(DropdownMenuContext);
  const animationController = useAnimationControls();

  return (
    <RadixDropdownMenu.Item
      onSelect={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await animationController.start("click");
        await animationController.start("idle");
        await sleep(0.075);
        await closeMenu();
        onSelect && onSelect(e);
      }}
      className={cn(
        "cursor-pointer rounded-md px-2 py-2 text-sm text-gray-600 select-none data-[highlighted]:bg-gray-500/10 data-[highlighted]:text-gray-800 data-[highlighted]:focus:outline-none",
        className,
      )}
      asChild
    >
      <motion.div
        animate={animationController}
        variants={{
          click: {
            backgroundColor: `rgba(107,114,128,0)`,
            color: color ? color : `rgb(107,114,128)`,
          },
          idle: {
            backgroundColor: highlightColor
              ? highlightColor
              : `rgba(107,114,128,0.1)`,
            color: color ? color : `rgb(107,114,128)`,
          },
        }}
        transition={{
          duration: 0.04,
        }}
      >
        {children}
      </motion.div>
    </RadixDropdownMenu.Item>
  );
};

export default DropdownMenuItem;
