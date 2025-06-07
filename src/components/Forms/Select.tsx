import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { useFieldContext } from "./Field";
import useGetBrowerDocument from "../../hooks/useGetBrowerDocument";
import { cn } from "../../utilities/cn";
import { CustomSlottedComponent } from "../../types/type-utils";

// ============================================================================
// Select Component
// ============================================================================

interface SelectProps extends SelectPrimitive.SelectProps {
  className?: string;
  selectClass?: string;
  chevronClass?: string;
  placeholder?: string;
  name: string;
  "data-invalid"?: boolean | string;
  "aria-describedby"?: string;
  container?: Element | DocumentFragment | null;
  onChange?: (value: string) => void;
}

const SelectRoot = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      selectClass,
      chevronClass,
      placeholder,
      disabled,
      "data-invalid": invalid,
      "aria-describedby": ariaDescribedBy,
      container,
      children,
      onChange,
      name,
      value,
      ...props
    },
    _ref,
  ) => {
    const { id, form, disabled: rootDisabled } = useFieldContext();
    const [open, setOpen] = useState(false);
    const doc = useGetBrowerDocument();
    const isDisabled =
      form?.formState?.isSubmitting || disabled || rootDisabled;

    return (
      <span
        data-slot="control"
        className={cn(
          // Container styles
          "relative block rounded-xl",
          "transition-all duration-150",

          // Focus states
          "focus-within:ring-2 focus-within:ring-gray-800 dark:focus-within:ring-white/30",
          "dark:focus-within:ring-offset-primary-dark focus-within:ring-offset-1 focus-within:ring-offset-inherit",

          // Invalid state
          "has-[button[data-invalid]]:focus-within:ring-red-700",

          // Custom class
          className,
        )}
      >
        <SelectPrimitive.Root
          open={open}
          onOpenChange={setOpen}
          disabled={isDisabled}
          value={value || form.watch(name)}
          onValueChange={(val) => {
            form.setValue(name, val);
            form.trigger(name);
            onChange?.(val);
          }}
          {...props}
        >
          <SelectPrimitive.Trigger
            id={id}
            data-invalid={invalid}
            aria-invalid={!!invalid}
            aria-describedby={ariaDescribedBy}
            aria-disabled={isDisabled}
            className={cn(
              // Base styles
              "group relative flex w-full appearance-none items-center justify-between",
              "dark:bg-primary-dark-foreground rounded-xl border-[1.5px] border-gray-300 bg-transparent dark:border-white/10",
              "text-sm/6 text-gray-800 placeholder:text-gray-500 dark:text-white dark:placeholder:text-white/50",

              // Padding
              "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)]",

              // States
              "hover:border-gray-400 focus:outline-none dark:hover:border-white/20",
              "data-[invalid]:border-red-700 focus:data-[invalid]:border-red-100",
              "data-disabled:border-gray-200 data-disabled:bg-gray-100 data-disabled:text-gray-400 dark:data-disabled:border-white/10 dark:data-disabled:bg-gray-900/50 dark:data-disabled:text-white/50",

              // Transitions
              "transition-all duration-150",

              // Custom class
              selectClass,
            )}
            {...form.register(name)}
          >
            <SelectPrimitive.Value
              placeholder={placeholder}
              className="truncate"
            />

            <SelectPrimitive.Icon asChild>
              <IoChevronDown
                className={cn(
                  // Base styles
                  "size-4 text-gray-600 transition-transform duration-200",

                  // States
                  // "group-data-[state=open]:rotate-180",
                  "group-data-[disabled]:text-gray-400",

                  //Custom class
                  chevronClass,
                )}
                aria-hidden="true"
              />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal
            container={container ?? doc?.getElementById("select-container")}
          >
            <SelectPrimitive.Content
              position="item-aligned"
              sideOffset={4}
              className={cn(
                // Base styles
                "z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl shadow-lg",
                "dark:from-primary-dark dark:to-primary-dark-foreground bg-gradient-to-br from-gray-900 to-gray-950 ring-1 ring-gray-800 dark:bg-gradient-to-br dark:ring-white/10",

                // Animations
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              )}
            >
              <SelectPrimitive.ScrollUpButton
                className={cn(
                  // Base styles
                  "flex items-center justify-center py-1",
                  // Interactive states
                  "text-gray-400 hover:text-gray-200",
                )}
              >
                <IoChevronUp className="size-4" />
              </SelectPrimitive.ScrollUpButton>

              <SelectPrimitive.Viewport className="p-1">
                {children}
              </SelectPrimitive.Viewport>

              <SelectPrimitive.ScrollDownButton
                className={cn(
                  // Base styles
                  "flex items-center justify-center py-1",
                  // Interactive states
                  "text-gray-400 hover:text-gray-200",
                )}
              >
                <IoChevronDown className="size-4" />
              </SelectPrimitive.ScrollDownButton>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </span>
    );
  },
);

SelectRoot.displayName = "Select";

// ============================================================================
// Option Component
// ============================================================================

interface OptionProps extends SelectPrimitive.SelectItemProps {
  level?: number;
}

const Option = forwardRef<HTMLDivElement, OptionProps>(
  ({ children, value, className, level = 1, ...props }, ref) => {
    return (
      <SelectPrimitive.Item
        ref={ref}
        value={value}
        style={{ paddingLeft: `${0.75 * level}rem` }}
        className={cn(
          // Base styles
          "relative flex cursor-pointer items-center rounded-lg p-3 text-sm select-none",
          "text-gray-200 outline-none",

          // States
          "data-[highlighted]:bg-[#421CA4] data-[highlighted]:text-white",
          "data-[state=checked]:font-medium",

          // Transitions
          "transition-colors",

          // Custom class
          className,
        )}
        data-testid={`select-option-${value}`}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  },
);

Option.displayName = "Select.Option";

// ============================================================================
// OptionLabel Component
// ============================================================================

interface OptionLabelProps extends SelectPrimitive.SelectLabelProps {}

const OptionLabel = forwardRef<HTMLDivElement, OptionLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <SelectPrimitive.Label
        ref={ref}
        className={cn(
          // Base styles
          "my-3 block px-3 text-xs font-medium tracking-wide",
          "text-gray-300",

          // Custom class
          className,
        )}
        {...props}
      >
        {children}
      </SelectPrimitive.Label>
    );
  },
);

OptionLabel.displayName = "Select.Label";

// ============================================================================
// Divider Component
// ============================================================================

interface DividerProps extends SelectPrimitive.SelectSeparatorProps {
  dividerClassName?: string;
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, dividerClassName, children, ...props }, ref) => {
    return (
      <SelectPrimitive.Separator
        ref={ref}
        className={cn(
          // Base styles
          "my-1 px-3",

          // Custom class
          className,
        )}
        {...props}
      >
        {children || (
          <div
            className={cn(
              // Base styles
              "w-full border-t",
              "border-gray-700",

              // Custom class
              dividerClassName,
            )}
          />
        )}
      </SelectPrimitive.Separator>
    );
  },
);

Divider.displayName = "Select.Divider";

// ============================================================================
// SelectGroup Component
// ============================================================================

interface SelectGroupProps extends SelectPrimitive.SelectGroupProps {
  Label: string | CustomSlottedComponent<"label">;
}

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, Label, ...props }, ref) => {
    return (
      <SelectPrimitive.Group ref={ref} {...props}>
        {Label && (
          <OptionLabel>
            {typeof Label === "function" ? <Label /> : Label}
          </OptionLabel>
        )}
        <div className="flex flex-col">{children}</div>
      </SelectPrimitive.Group>
    );
  },
);

SelectGroup.displayName = "Select.Group";

// ============================================================================
// Compound Component Export
// ============================================================================

export const Select = Object.assign(SelectRoot, {
  Option,
  Label: OptionLabel,
  Divider,
  Group: SelectGroup,
});

export default Select;
