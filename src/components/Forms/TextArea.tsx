"use client";

import { ComponentProps, forwardRef, Ref } from "react";
import { cn } from "../../utilities/cn";
import { useFieldContext } from "./Field";

interface ITextArea extends ComponentProps<"textarea"> {
  textAreaClass?: string;
}

// Wrap your component with forwardRef
const TextArea = forwardRef<HTMLTextAreaElement, ITextArea>(
  (
    {
      // Specify the type of the ref and props
      className,
      textAreaClass,
      disabled,
      ...rest
    }: ITextArea,
    ref: Ref<HTMLTextAreaElement>,
  ) => {
    // Add ref as the second argument
    const { id, form, disabled: rootDisabled, name } = useFieldContext(); // Added 'name' for consistency if needed for error handling like in Input
    const hasError = name && form.formState.errors[name]; // Added for consistency, though not directly used in styles like in Input

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

          // Invalid state (assuming you might add data-invalid to textarea similarly)
          "has-[textarea[data-invalid=true]]:focus-within:ring-red-700",

          // Custom class
          className,
        )}
      >
        <textarea
          ref={ref} // Pass the ref to the actual textarea element
          id={id}
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
            textAreaClass,
          )}
          disabled={form.formState.isSubmitting || disabled || rootDisabled}
          data-invalid={!!hasError || undefined}
          {...rest}
        />
      </span>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
