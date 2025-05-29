import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";
import { useFieldContext } from "./Field";

interface ILabel extends Omit<ComponentProps<"label">, "htmlFor"> {}

const Label = ({ className, children, ...rest }: ILabel) => {
  const { id } = useFieldContext();

  return (
    <label
      data-slot="label"
      className={cn(
        // Base styles
        "text-sm/6 text-gray-800 dark:text-white",

        // Interaction states
        "select-none",
        "data-disabled:opacity-50",
        "group-data-[disabled=true]:text-gray-400",

        // Custom class
        className,
      )}
      htmlFor={id}
      {...rest}
    >
      {children}
    </label>
  );
};

export default Label;
