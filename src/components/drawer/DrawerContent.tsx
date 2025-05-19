import { cn } from "../../utilities/cn";
import { forwardRef, useEffect, useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import DrawerOverlay from "./DrawerOverlay";

type DrawerContentRef = React.ComponentRef<typeof DrawerPrimitive.Content>;
type DrawerContentProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
> & {
  direction?: "left" | "right" | "top" | "bottom";
};

const DrawerContent = forwardRef<DrawerContentRef, DrawerContentProps>(
  ({ className, children, direction, ...props }, ref) => {
    const [doc, setDoc] = useState<Document | undefined>(undefined);
    useEffect(() => {
      if (window) {
        setDoc(window.document);
      }
    }, []);

    return (
      <DrawerPrimitive.Portal
        container={doc?.getElementById("drawer-container")}
      >
        <DrawerOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          className={cn(
            "fixed inset-0 z-[999] mt-0 flex h-auto flex-col focus:outline-none",
            className,
          )}
          {...props}
        >
          {/* handle */}
          {(!direction || direction === "bottom") && (
            <div className="mx-auto mt-4 mb-3 h-1.5 w-[40px] shrink-0 rounded-full bg-gray-200" />
          )}
          {/* handle */}

          {children}
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

export default DrawerContent;
