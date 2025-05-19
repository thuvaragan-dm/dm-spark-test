import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ComponentProps } from "react";
import { DialogContext } from "./context";

type IDialogRoot = ComponentProps<typeof DialogPrimitive.Root> & {
  hideOverlay?: boolean;
};

const DialogRoot = ({
  open = false,
  onOpenChange = () => {},
  hideOverlay = false,
  ...props
}: IDialogRoot) => {
  return (
    <DialogContext.Provider
      value={{ isOpen: open, setIsOpen: onOpenChange, hideOverlay }}
    >
      <DialogPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        {...props}
      />
    </DialogContext.Provider>
  );
};

export default DialogRoot;
