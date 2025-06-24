import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";

interface ITextAreaGroup extends ComponentProps<"div"> {}
const TextAreaGroup = ({ className, children, ...rest }: ITextAreaGroup) => {
  return (
    <div
      role="group"
      data-slot="control"
      className={cn(
        "group relative isolate block",

        // Icon base styles
        "*:data-[slot=icon]:pointer-events-none",
        "*:data-[slot=icon]:absolute",
        "*:data-[slot=icon]:top-3",
        "*:data-[slot=icon]:z-10",
        "*:data-[slot=icon]:size-5",
        "*:data-[slot=icon]:text-gray-500 *:data-[slot=icon]:dark:text-white/50",
        "*:data-[slot=icon]:group-data-[disabled=true]:text-gray-400",

        // Input padding when icons are present
        "has-[[data-slot=icon]:first-child]:[&_textarea]:pl-10",
        "has-[[data-slot=icon]:last-child]:[&_textarea]:pr-10",

        "has-[[data-slot=icon]:first-child]:[&_[role=combobox]>span:first-child]:pl-7",

        // Handle both direct children and nested slots
        "[&>[data-slot=control]+[data-slot=error]]:mt-1",

        // Icon positioning
        "[&>[data-slot=icon]:first-child]:left-3",
        "[&>[data-slot=icon]:last-child]:right-3",

        // Focus states
        "focus-within:*:data-[slot=icon]:text-primary focus-within:*:data-[slot=icon]:dark:text-white",

        // When child textarea has data-invalid attribute
        "has-[textarea[data-invalid=true]]:focus-within:*:data-[slot=icon]:text-red-700",

        // When child select has data-invalid attribute
        "has-[button[data-invalid=true][role='combobox']]:focus-within:*:data-[slot=icon]:text-red-700",

        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default TextAreaGroup;
