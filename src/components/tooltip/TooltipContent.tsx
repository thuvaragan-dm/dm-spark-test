import { ComponentProps } from "react";
import { Tooltip } from "react-aria-components";
import { cn } from "../../utilities/cn";

type ITooltipContent = ComponentProps<typeof Tooltip>;

const TooltipContent = ({ children, className, ...props }: ITooltipContent) => {
  return (
    <Tooltip
      className={cn(
        "relative flex flex-col rounded-lg border border-gray-300 bg-white/90 p-3 shadow-lg backdrop-blur-lg dark:border-[#3C3B3B] dark:bg-white/5",
        className,
      )}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default TooltipContent;
