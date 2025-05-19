import { cn } from "../../utilities/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";

type DialogCloseRef = React.ComponentRef<typeof DialogPrimitive.Close>;
type DialogCloseProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Close
>;

const DialogClose = forwardRef<DialogCloseRef, DialogCloseProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Close ref={ref} className={cn("", className)} {...props} />
  ),
);
DialogClose.displayName = DialogPrimitive.Close.displayName;

export default DialogClose;
