import { cn } from "../../utilities/cn";
import { ComponentProps } from "react";

interface IDialogHeader extends ComponentProps<"div"> {}
const DialogHeader = ({ className, ...props }: IDialogHeader) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
export default DialogHeader;
