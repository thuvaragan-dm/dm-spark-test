import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { cn } from "../../utilities/cn";

type DrawerTriggerRef = React.ComponentRef<typeof DialogPrimitive.Trigger>;
type DrawerTriggerProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Trigger
>;

const ModalButton = forwardRef<DrawerTriggerRef, DrawerTriggerProps>(
  ({ className, ...props }, ref) => {
    const isMd = useBreakpoint("md");
    if (isMd) {
      return (
        <DialogPrimitive.Trigger
          ref={ref}
          className={cn("", className)}
          {...props}
        />
      );
    } else {
      return (
        <DrawerPrimitive.Trigger
          ref={ref}
          className={cn("", className)}
          {...props}
        />
      );
    }
  },
);
ModalButton.displayName = "ModalButton";

export default ModalButton;
