import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useId,
} from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cn } from "../../utilities/cn";
import { useFormContext } from "./Form";
import { useMultiStepForm } from "./MultiStepForm";

interface FieldContextValue {
  id: string;
  name?: string;
  form: UseFormReturn<any>;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export const useFieldContext = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error("useFieldContext must be used within a Field component");
  }
  return context;
};

interface IField<T extends z.ZodType<any, any>>
  extends Omit<ComponentProps<"div">, "children"> {
  children: ((context: UseFormReturn<z.infer<T>>) => ReactNode) | ReactNode;
  disabled?: boolean;
  name?: string;
}

const Field = <T extends z.ZodType<any, any>>({
  className,
  children,
  name,
  disabled = false,
  ...rest
}: IField<T>) => {
  // Always call hooks unconditionally at the top level
  const formContext = useSafeFormContext<T>();
  const multiStepContext = useSafeMultiStepForm();

  // Determine which form to use
  const form =
    formContext ?? (multiStepContext?.methods as UseFormReturn<z.infer<T>>);

  if (!form) {
    throw new Error(
      "Field must be used within a Form or MultiStepForm component",
    );
  }

  const id = useId();
  const {
    formState: { errors },
  } = form;

  return (
    <FieldContext.Provider value={{ id, name, form, disabled }}>
      <div
        className={cn(
          "group w-full",
          "*:data-[slot=label]:font-medium",
          "[&>[data-slot=control]+[data-slot=description]]:mt-1",
          "[&>[data-slot=control]+[data-slot=error]]:mt-1",
          "[&>[data-slot=description]+[data-slot=control]]:mt-2",
          "[&>[data-slot=label]+[data-slot=control]]:mt-1",
          "[&>[data-slot=label]+[data-slot=description]]:mt-1",
          "[&>[data-slot=label-wrapper]>[data-slot=label]]:font-medium",
          "[&>[data-slot=label-wrapper]+[data-slot=control]]:mt-2",
          "[&>[data-slot=label-wrapper]>[data-slot=label]+[data-slot=description]]:mt-1",
          className,
        )}
        role="group"
        aria-labelledby={name ? `${name}-label` : undefined}
        aria-describedby={
          name && errors[name as keyof z.infer<T>] ? `${name}-error` : undefined
        }
        aria-disabled={disabled}
        data-disabled={disabled}
        data-invalid={disabled}
        {...rest}
      >
        {typeof children === "function" ? children(form) : children}
      </div>
    </FieldContext.Provider>
  );
};

// Helper hooks that don't throw errors
function useSafeFormContext<T extends z.ZodType<any, any>>() {
  try {
    return useFormContext<T>();
  } catch {
    return null;
  }
}

function useSafeMultiStepForm() {
  try {
    return useMultiStepForm();
  } catch {
    return null;
  }
}

export default Field;
