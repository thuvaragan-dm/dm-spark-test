import { ComponentProps } from "react";
import { TooltipTrigger } from "react-aria-components";

type ITooltipRoot = ComponentProps<typeof TooltipTrigger>;

const TooltipRoot = ({ children, ...props }: ITooltipRoot) => {
  return <TooltipTrigger {...props}>{children}</TooltipTrigger>;
};

export default TooltipRoot;
