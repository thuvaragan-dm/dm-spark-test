import { ComponentProps } from "react";
import { TooltipTrigger } from "react-aria-components";

type ITooltipAria = ComponentProps<typeof TooltipTrigger> & {
  delayDuration?: number;
};

const TooltipAria = ({ children, ...props }: ITooltipAria) => {
  return <TooltipTrigger {...props}>{children}</TooltipTrigger>;
};

export default TooltipAria;
