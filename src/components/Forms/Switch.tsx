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
  ...props
}: {
  children?: ReactNode;
  name?: string;
  onChange?: (value: boolean) => void;
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
      <span className="group-data-[selected]:bg-primary h-7 w-10 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 ring-offset-2 ring-offset-inherit transition duration-200 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-40 group-data-[focus-visible]:ring-2 dark:bg-white/30">
        <span className="block h-6 w-6 origin-right rounded-full bg-white shadow transition-all duration-200 group-data-[hovered]:w-7 group-data-[pressed]:w-7 group-data-[selected]:ml-3 group-data-[selected]:group-data-[hovered]:ml-2 group-data-[selected]:group-data-[pressed]:ml-2" />
      </span>
      {children && children}
    </AriaSwitch>
  );
};

export default Switch;
