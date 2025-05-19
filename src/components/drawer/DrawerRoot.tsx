import { ComponentProps } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { DrawerContext } from "./context";

type IDrawerRoot = ComponentProps<typeof DrawerPrimitive.Root>;
const DrawerRoot = ({
  open,
  onOpenChange = () => {},
  ...props
}: IDrawerRoot) => {
  return (
    <DrawerContext.Provider value={{ isOpen: !!open, setIsOpen: onOpenChange }}>
      <DrawerPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        {...props}
      />
    </DrawerContext.Provider>
  );
};

export default DrawerRoot;
