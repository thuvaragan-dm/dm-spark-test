import { ComponentProps, forwardRef, Ref } from "react"; // Import forwardRef and Ref
import { cn } from "../../utilities/cn";
import { useFieldContext } from "./Field";

interface IInput extends ComponentProps<"input"> {
  inputClass?: string;
}

// Wrap your component with forwardRef
const Input = forwardRef<HTMLInputElement, IInput>(
  (
    {
      // Specify the type of the ref and props
      className,
      inputClass: inputClass,
      disabled,
      type = "text",
      ...rest
    }: IInput,
    ref: Ref<HTMLInputElement>,
  ) => {
    // Add ref as the second argument
    const { id, form, disabled: rootDisabled, name } = useFieldContext();
    const hasError = name && !!form.formState.errors[name];

    return (
      <span
        data-slot="control"
        className={cn(
          // Container styles
          "relative block rounded-xl",
          "transition-all duration-150",

          // Focus states
          "focus-within:ring-primary focus-within:ring-2 dark:focus-within:ring-white/30",
          "dark:focus-within:ring-offset-primary-dark focus-within:ring-offset-1 focus-within:ring-offset-inherit",

          // Invalid state
          "has-[input[data-invalid=true]]:focus-within:ring-red-700",

          // Custom class
          className,
        )}
      >
        <input
          ref={ref} // Pass the ref to the actual input element
          id={id}
          type={type}
          className={cn(
            // Base style
            "relative block w-full appearance-none rounded-xl",
            "dark:bg-primary-dark-foreground border-[1.5px] border-gray-300 bg-transparent dark:border-white/10",
            "text-sm/6 text-gray-800 placeholder:text-gray-500 dark:text-white dark:placeholder:text-white/50",

            // Padding
            "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)]",

            // States
            "focus:outline-hidden enabled:hover:border-gray-400 dark:enabled:hover:border-white/20",
            "data-[invalid=true]:border-red-700 focus:data-[invalid=true]:border-red-100 dark:data-[invalid=true]:border-red-700/70 dark:focus:data-[invalid=true]:border-red-700/50",
            "data-[invalid=true]:enabled:hover:border-red-700 dark:data-[invalid=true]:enabled:hover:border-red-700",

            // Disabled state
            "group-data-[disabled=true]:bg-gray-100 dark:group-data-[disabled=true]:bg-white/20",
            "group-data-[disabled=true]:text-gray-400 group-data-[disabled=true]:placeholder-gray-400 dark:group-data-[disabled=true]:text-white/50",
            "group-data-[disabled=true]:border-gray-200 dark:group-data-[disabled=true]:border-white/10",
            "data-disabled:border-gray-200 data-disabled:bg-gray-100 data-disabled:text-red-400 dark:data-disabled:border-white/10 dark:data-disabled:bg-gray-900/50 dark:data-disabled:text-white/50",

            // Transitions
            "transition-all duration-150",

            // Custom class
            inputClass,
          )}
          disabled={form.formState.isSubmitting || disabled || rootDisabled}
          data-invalid={hasError || undefined}
          {...rest}
        />
      </span>
    );
  },
);

Input.displayName = "Input";
export default Input;
