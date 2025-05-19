import * as Tooltip from "@radix-ui/react-tooltip";
import { ComponentProps, useEffect, useState } from "react";

type ITooltipContent = ComponentProps<typeof Tooltip.Content>;

const TooltipContent = ({ children, ...props }: ITooltipContent) => {
  const [doc, setDoc] = useState<Document | undefined>(undefined);
  useEffect(() => {
    if (window) {
      setDoc(window.document);
    }
  }, []);

  return (
    <Tooltip.Portal container={doc?.getElementById("tooltip-container")}>
      <Tooltip.Content {...props}>{children}</Tooltip.Content>
    </Tooltip.Portal>
  );
};

export default TooltipContent;
