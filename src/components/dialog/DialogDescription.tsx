import { cn } from "../../utilities/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";

type DialogDescriptionRef = React.ComponentRef<
  typeof DialogPrimitive.Description
>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

const DialogDescription = React.forwardRef<
  DialogDescriptionRef,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-white/60", className)}
    {...props}
  />
));

DialogDescription.displayName = DialogPrimitive.Description.displayName;

export default DialogDescription;
