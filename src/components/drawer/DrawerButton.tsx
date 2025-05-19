import { cn } from "../../utilities/cn";
import { forwardRef } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

type DrawerTriggerRef = React.ComponentRef<typeof DrawerPrimitive.Trigger>;
type DrawerTriggerProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Trigger
>;

const DrawerButton = forwardRef<DrawerTriggerRef, DrawerTriggerProps>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Trigger
      ref={ref}
      asChild
      className={cn("", className)}
      {...props}
    />
  ),
);
DrawerButton.displayName = DrawerPrimitive.Trigger.displayName;

export default DrawerButton;
