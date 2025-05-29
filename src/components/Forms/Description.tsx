import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";
import { useFieldContext } from "./Field";

interface IDescription extends ComponentProps<"p"> {}

const Description = ({ className, children, ...rest }: IDescription) => {
  const { id } = useFieldContext();

  return (
    <p
      id={`description-${id}`}
      data-slot="description"
      className={cn(
        // Base styles
        "text-sm text-gray-500 sm:text-xs",

        // Disabled states
        "data-disabled:opacity-50",
        "group-data-[disabled=true]:text-gray-300",

        // Custom class
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
};

export default Description;
