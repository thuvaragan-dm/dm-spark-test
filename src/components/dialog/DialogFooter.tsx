import { cn } from "../../utilities/cn";
import { ComponentProps } from "react";

interface IDialogHeader extends ComponentProps<"div"> {}

const DialogFooter = ({ className, ...props }: IDialogHeader) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
export default DialogFooter;
