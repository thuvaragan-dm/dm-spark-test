import * as Tooltip from "@radix-ui/react-tooltip";
import { ComponentProps } from "react";

type ITooltipRoot = ComponentProps<typeof Tooltip.Root> & {
  delayDuration?: number;
};

const TooltipRoot = ({
  children,
  delayDuration = 700,
  ...props
}: ITooltipRoot) => {
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root disableHoverableContent={false} {...props}>
        {children}
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default TooltipRoot;
