import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { DropdownContext } from "./context";

interface IDropdown extends RadixDropdownMenu.DropdownMenuProps {}

const DropdownRoot = ({
  open,
  onOpenChange = () => {},
  children,
}: IDropdown) => {
  return (
    <DropdownContext.Provider
      value={{ isOpen: !!open, setIsOpen: onOpenChange }}
    >
      <RadixDropdownMenu.Root open={!!open} onOpenChange={onOpenChange}>
        {children}
      </RadixDropdownMenu.Root>
    </DropdownContext.Provider>
  );
};

export default DropdownRoot;
