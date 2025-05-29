import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";

interface ILabelGroup extends ComponentProps<"div"> {}
const LabelGroup = ({ className, children }: ILabelGroup) => {
  return (
    <div
      role="group"
      data-slot="label-wrapper"
      className={cn("group", className)}
    >
      {children}
    </div>
  );
};

export default LabelGroup;
