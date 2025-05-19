import { cn } from "../../utilities/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { forwardRef } from "react";

type DialogTitleRef = React.ComponentRef<typeof DialogPrimitive.Title>;
type DialogTitleProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

const DialogTitle = forwardRef<DialogTitleRef, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "text-lg leading-none font-semibold tracking-tight text-gray-800 dark:text-white",
        className,
      )}
      {...props}
    />
  ),
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export default DialogTitle;
