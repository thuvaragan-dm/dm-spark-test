import { zodResolver } from "@hookform/resolvers/zod";
import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cn } from "../../utilities/cn";

// Create a context for the form methods
const FormContext = createContext<UseFormReturn<any> | undefined>(undefined);

// Custom hook to access form context
export const useFormContext = <T extends z.ZodType<any, any>>() => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form component");
  }
  return context as UseFormReturn<z.infer<T>>;
};

interface IForm<T extends z.ZodType<any, any>>
  extends Omit<ComponentProps<"form">, "children" | "onSubmit"> {
  children: ((context: UseFormReturn<z.infer<T>>) => ReactNode) | ReactNode;
  validationSchema: T;
  defaultValues?: z.infer<T>;
  onSubmit?: (
    values: z.infer<T>,
    methods: UseFormReturn<z.infer<T>>,
  ) => void | Promise<void>;
  formOptions?: UseFormProps<z.infer<T>>;
  isLoading?: boolean;
  "aria-label"?: string;
}

const Form = <T extends z.ZodType<any, any>>({
  validationSchema,
  defaultValues,
  onSubmit = () => {},
  children,
  className,
  formOptions = { mode: "onSubmit" },
  isLoading = false,
  "aria-label": ariaLabel = "Form",
  ...rest
}: IForm<T>) => {
  const methods = useForm<T>({
    resolver: zodResolver(validationSchema),
    defaultValues,
    ...formOptions,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors, isDirty, isValid },
  } = methods;

  const formState = useMemo(
    () => ({
      isSubmitting,
      isLoading,
      isDirty,
      isValid,
      hasErrors: Object.keys(errors).length > 0,
    }),
    [isSubmitting, isLoading, isDirty, isValid, errors],
  );

  return (
    <FormContext.Provider value={methods}>
      <form
        onSubmit={handleSubmit((values) => onSubmit(values, methods))}
        className={cn("group", className)}
        noValidate
        aria-label={ariaLabel}
        aria-busy={formState.isSubmitting || formState.isLoading}
        data-disabled={formState.isSubmitting || formState.isLoading}
        role="form"
        {...rest}
      >
        {typeof children === "function" ? children(methods) : children}
      </form>
    </FormContext.Provider>
  );
};

export default Form;
