import { ComponentProps } from "react";
import { Drawer } from ".";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { cn } from "../../utilities/cn";

interface IDrawerSheet extends ComponentProps<"div"> {}
const SheetContent = ({ children, className }: IDrawerSheet) => {
  const isMd = useBreakpoint("md");
  return (
    <Drawer.Content
      direction={isMd ? "right" : "bottom"}
      className={cn(
        "z-[10] flex flex-col p-1.5 md:ml-[40%] md:p-0 lg:ml-[60%]",
        className,
      )}
    >
      {children}
    </Drawer.Content>
  );
};

export default SheetContent;
