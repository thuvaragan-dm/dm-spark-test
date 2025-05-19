import * as Tooltip from "@radix-ui/react-tooltip";
import { ComponentProps } from "react";

type ITooltipTrigger = ComponentProps<typeof Tooltip.Trigger>;

const TooltipTrigger = ({ children, ...props }: ITooltipTrigger) => {
  return <Tooltip.Trigger {...props}>{children}</Tooltip.Trigger>;
};

export default TooltipTrigger;
