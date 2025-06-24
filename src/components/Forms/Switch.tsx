"use client";

import { ComponentProps, ReactNode } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import { useFieldContext } from "./Field";
import { cn } from "../../utilities/cn";

const Switch = ({
  name,
  children,
  className,
  isDisabled,
  onChange,
  value,
  switchClass,
  ...props
}: {
  children?: ReactNode;
  name?: string;
  onChange?: (value: boolean) => void;
  switchClass?: string;
} & Omit<ComponentProps<typeof AriaSwitch>, "id" | "name" | "onChange">) => {
  const { id, disabled: rootDisabled, form } = useFieldContext();
  return (
    <AriaSwitch
      id={id}
      data-slot="control"
      isDisabled={form.formState.isSubmitting || isDisabled || rootDisabled}
      className={cn("group inline-flex touch-none items-center", className)}
      style={{ WebkitTapHighlightColor: "transparent" }}
      defaultSelected={value || (name && form.watch(name))}
      onChange={(val) => {
        if (name) {
          form.setValue(name, val);
          form.trigger(name);
        }
        onChange?.(val);
      }}
      {...props}
    >
      <span
        className={cn(
          "group-data-[selected]:bg-primary flex h-6 w-10 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-300 ring-offset-2 ring-offset-inherit transition duration-200 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-40 group-data-[focus-visible]:ring-2 dark:bg-white/10 dark:bg-white/30",
          switchClass,
        )}
      >
        <span className="dark:bg-primary-dark-foreground ml-1 block h-4 w-4 origin-right rounded-full bg-white shadow transition-all duration-200 group-data-[hovered]:w-5 group-data-[pressed]:w-5 group-data-[selected]:ml-4 group-data-[selected]:group-data-[hovered]:ml-3 group-data-[selected]:group-data-[pressed]:ml-2 dark:group-data-[selected]:bg-white" />
      </span>
      {children && children}
    </AriaSwitch>
  );
};

export default Switch;
