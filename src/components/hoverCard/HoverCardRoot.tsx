import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { HoverCardContext } from "./context";

interface IHoverCard extends RadixHoverCard.HoverCardProps {}

const HoverCardRoot = ({
  open,
  onOpenChange = () => {},
  children,
  ...props
}: IHoverCard) => {
  return (
    <HoverCardContext.Provider
      value={{ isOpen: !!open, setIsOpen: onOpenChange }}
    >
      <RadixHoverCard.Root open={!!open} onOpenChange={onOpenChange} {...props}>
        {children}
      </RadixHoverCard.Root>
    </HoverCardContext.Provider>
  );
};

export default HoverCardRoot;
