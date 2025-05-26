import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { cn } from "../../utilities/cn";

interface IHoverCardButton extends RadixHoverCard.HoverCardTriggerProps {}

const HoverCardButton = ({ children, className }: IHoverCardButton) => {
  return (
    <RadixHoverCard.Trigger
      className={cn("cursor-default select-none", className)}
    >
      {children}
    </RadixHoverCard.Trigger>
  );
};

export default HoverCardButton;
