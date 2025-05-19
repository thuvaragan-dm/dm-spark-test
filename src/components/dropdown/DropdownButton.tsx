import { cn } from "../../utilities/cn";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";

interface IDropdownButton
  extends RadixDropdownMenu.DropdownMenuSubTriggerProps {}

const DropdownButton = ({ children, className }: IDropdownButton) => {
  return (
    <RadixDropdownMenu.Trigger
      className={cn(
        "cursor-default rounded px-4 text-2xl select-none focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </RadixDropdownMenu.Trigger>
  );
};

export default DropdownButton;
