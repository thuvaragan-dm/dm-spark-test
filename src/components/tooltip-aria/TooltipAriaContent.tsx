import { ComponentProps } from "react";
import { Tooltip } from "react-aria-components";

type ITooltipAriaContent = ComponentProps<typeof Tooltip> & {
  delayDuration?: number;
};

const TooltipAriaContent = ({ children, ...props }: ITooltipAriaContent) => {
  return <Tooltip {...props}>{children}</Tooltip>;
};

export default TooltipAriaContent;
