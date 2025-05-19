import { ComponentProps } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { DrawerContext } from "./context";

type IDrawerRoot = ComponentProps<typeof DrawerPrimitive.Root>;
const SheetRoot = ({
  open,
  onOpenChange = () => {},
  ...props
}: IDrawerRoot) => {
  const isMd = useBreakpoint("md");
  return (
    <DrawerContext.Provider value={{ isOpen: !!open, setIsOpen: onOpenChange }}>
      <DrawerPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        direction={isMd ? "right" : "bottom"}
        {...props}
      />
    </DrawerContext.Provider>
  );
};

export default SheetRoot;
