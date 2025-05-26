import { ComponentProps } from "react";
import { OverlayArrow } from "react-aria-components";
import { cn } from "../../utilities/cn";

type ITooltipArrow = ComponentProps<typeof OverlayArrow>;

const TooltipArrow = ({ className, ...props }: ITooltipArrow) => {
  return (
    <OverlayArrow
      className={cn(
        "fill-white dark:fill-[#262626]",
        "data-[placement='right']:-mr-[0.3px] data-[placement='right']:rotate-90",
        "data-[placement='bottom']:-mb-[0.8px] data-[placement='bottom']:-ml-[(--spacing(3.7))] data-[placement='bottom']:rotate-180",
        className,
      )}
      {...props}
    >
      <svg
        width="15"
        height="8"
        viewBox="0 0 24 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="2" />
        <path
          d="M24 1C18 1 17 11 12 11C7 11 6 0.999999 8.74228e-07 0.999999"
          strokeWidth="1.5"
          strokeLinejoin="miter"
          className="fill-white stroke-gray-300 dark:fill-[#262626] dark:stroke-white/10"
        />
      </svg>
    </OverlayArrow>
  );
};

export default TooltipArrow;
