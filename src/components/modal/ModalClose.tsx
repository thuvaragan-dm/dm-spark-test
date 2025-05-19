import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { cn } from "../../utilities/cn";

type DrawerCloseRef = React.ComponentRef<typeof DrawerPrimitive.Close>;
type DrawerCloseProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Close
>;

const ModalClose = forwardRef<DrawerCloseRef, DrawerCloseProps>(
  ({ className, ...props }, ref) => {
    const isMd = useBreakpoint("md");
    if (isMd) {
      return (
        <DialogPrimitive.Close
          ref={ref}
          className={cn("", className)}
          {...props}
        />
      );
    } else {
      return (
        <DrawerPrimitive.Close
          ref={ref}
          className={cn("", className)}
          {...props}
        />
      );
    }
  },
);
ModalClose.displayName = "ModalClose";

export default ModalClose;
