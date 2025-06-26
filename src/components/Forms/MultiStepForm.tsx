import { zodResolver } from "@hookform/resolvers/zod";
import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { cn } from "../../utilities/cn";

interface MultiStepFormContextType<T extends z.ZodType<any, any>> {
  methods: UseFormReturn<z.infer<T>>;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
}

/**
 * Context for sharing MultiStepForm state and methods with child components.
 */
const MultiStepFormContext =
  createContext<MultiStepFormContextType<any> | null>(null);

export const useMultiStepForm = <T extends z.ZodType<any, any>>() => {
  const context = useContext(
    MultiStepFormContext,
  ) as MultiStepFormContextType<T> | null;
  if (!context) {
    throw new Error("useMultiStepForm must be used within a MultiStepForm");
  }
  return context;
};

interface MultiStepFormProps<T extends z.ZodType<any, any>>
  extends Omit<ComponentProps<"form">, "onSubmit"> {
  children: ReactNode;
  validationSchema: T;
  defaultValues?: z.infer<T>;
  onSubmit: (
    values: z.infer<T>,
    goToStep: (step: number) => void,
    methods: UseFormReturn<z.infer<T>>,
  ) => void | Promise<void>;
  formOptions?: UseFormProps<z.infer<T>>;
  isLoading?: boolean;
  "aria-label"?: string;
}

/**
 * A multi-step form component that manages form state and step navigation.
 * @template T - The Zod schema type for the form data.
 * @param props - The component props.
 * @returns A form element wrapping the current step and providing context for step navigation.
 * @example
 * <MultiStepForm
 *   validationSchema={SetupYourProfileSchema}
 *   onSubmit={(values) => console.log(values)}
 *   defaultValues={{ first_name: "", last_name: "" }}
 * >
 *   <FormSteps>
 *     <FormStep><PersonalInformationForm /></FormStep>
 *     <FormStep><UseCaseForm /></FormStep>
 *     <StepIndicator />
 *   </FormSteps>
 * </MultiStepForm>
 */
export const MultiStepForm = <T extends z.ZodType<any, any>>({
  children,
  validationSchema,
  defaultValues,
  onSubmit,
  formOptions = { mode: "onSubmit" },
  className,
  "aria-label": ariaLabel = "Form",
  isLoading = false,
  ...rest
}: MultiStepFormProps<T>) => {
  const methods = useForm<z.infer<T>>({
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

  // Calculate totalSteps by finding FormSteps and counting its FormStep children
  let totalSteps = 0;
  if (children) {
    const formSteps = Array.isArray(children)
      ? children.find(
          (child) =>
            child &&
            typeof child === "object" &&
            "type" in child &&
            child.type === FormSteps,
        )
      : children &&
          typeof children === "object" &&
          "type" in children &&
          children.type === FormSteps
        ? children
        : null;

    if (formSteps && "props" in formSteps && formSteps.props.children) {
      const stepChildren = Array.isArray(formSteps.props.children)
        ? formSteps.props.children
        : [formSteps.props.children];
      totalSteps = stepChildren.filter(
        (child: ReactNode) =>
          child &&
          typeof child === "object" &&
          "type" in child &&
          child.type === FormStep,
      ).length;
    }
  }

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleFormSubmit = handleSubmit(async (values) => {
    if (!isLastStep) return nextStep();
    await onSubmit(values, goToStep, methods);
  });

  return (
    <MultiStepFormContext.Provider
      value={{
        methods,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isFirstStep,
        isLastStep,
        goToStep,
      }}
    >
      <form
        onSubmit={handleFormSubmit}
        className={cn("group", className)}
        noValidate
        aria-label={ariaLabel}
        aria-busy={formState.isSubmitting || formState.isLoading}
        data-disabled={formState.isSubmitting || formState.isLoading}
        role="form"
        {...rest}
      >
        {children}
      </form>
    </MultiStepFormContext.Provider>
  );
};

/**
 * A single step in the multi-step form.
 * @param props - The component props.
 * @param props.children - The content of the form step.
 * @returns The children of the step, rendered when the step is active.
 * @example
 * <FormStep>
 *   <input type="text" {...register("first_name")} />
 * </FormStep>
 */
export const FormStep = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

/**
 * A wrapper for form steps, rendering the current step and allowing additional elements like StepIndicator.
 * @param props - The component props.
 * @param props.children - FormStep components and optional elements like StepIndicator.
 * @returns The current FormStep content.
 * @example
 * <FormSteps>
 *   <FormStep><PersonalInformationForm /></FormStep>
 *   <FormStep><UseCaseForm /></FormStep>
 *   <StepIndicator />
 * </FormSteps>
 */
export const FormSteps = ({ children }: { children: ReactNode }) => {
  const { currentStep } = useMultiStepForm();
  const steps = Array.isArray(children)
    ? children.filter(
        (child) =>
          child &&
          typeof child === "object" &&
          "type" in child &&
          child.type === FormStep,
      )
    : children &&
        typeof children === "object" &&
        "type" in children &&
        children.type === FormStep
      ? [children]
      : [];
  return <>{steps[currentStep]}</>;
};
