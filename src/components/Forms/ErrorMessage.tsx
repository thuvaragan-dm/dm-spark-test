import { ComponentProps } from "react";
import { cn } from "../../utilities/cn";

interface IErrorMessage extends ComponentProps<"p"> {}
const ErrorMessage = ({ className, children }: IErrorMessage) => {
  return (
    <p
      data-slot="error"
      className={cn(
        "min-h-6 text-sm/6 text-red-700 data-disabled:opacity-50",
        className,
      )}
    >
      {children}
    </p>
  );
};

export default ErrorMessage;
