import { cva, VariantProps } from "class-variance-authority";
import {
  AnimationDefinition,
  motion,
  useAnimationControls,
} from "motion/react";
import { ComponentProps, forwardRef } from "react";
import { Button as Btn, ButtonProps, PressEvent } from "react-aria-components";
import { cn } from "../utilities/cn";
import Spinner from "./Spinner";

// Button style variants
const variants = {
  variant: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    unstyled: "btn-unstyled",
    danger: "btn-danger",
    ghost: "btn-ghost p-0 md:p-0",
  },
};

const defaultStyles = cn(
  "touch-none select-none cursor-pointer overflow-hidden disabled:cursor-not-allowed rounded-xl bg-[var(--color-btn)] dark:bg-[var(--color-btn-dark)] text-[var(--color-btn-text)] text-sm font-medium outline-none ring-[var(--color-btn-ring)] ring-offset-2 ring-offset-inherit hover:bg-[var(--color-btn-hover)] focus:outline-none disabled:text-[var(--color-btn-text-disabled)] disabled:bg-[var(--color-btn-disabled)] data-[pressed]:bg-[var(--color-btn-active)] data-[focus-visible]:ring-2 px-5 py-3",
);

export const ButtonVariants = cva(defaultStyles, {
  variants,
  defaultVariants: {
    variant: "primary",
  },
});

export interface IButton
  extends ButtonProps,
    VariantProps<typeof ButtonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  wrapperClass?: string;
  loaderClass?: string;
  disabledLoaderClass?: string;
}

// Loader component for displaying loading spinner and content
const Loader = ({
  children,
  isLoading = false,
  isDisabled = false,
  className,
  disabledClass = "text-[var(--color-btn-text-disabled)]",
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  disabledClass?: string;
}) => {
  return (
    <motion.span
      initial={isLoading ? "loading" : "idle"}
      animate={isLoading ? "loading" : "idle"}
      variants={{
        idle: {
          transition: {
            staggerChildren: 0.2,
          },
        },
        loading: {
          transition: {
            staggerChildren: 0.2,
            staggerDirection: -1,
          },
        },
      }}
      className={cn("relative flex items-center px-2.5", className)}
      aria-live="polite"
      aria-busy={isLoading ? "true" : "false"}
    >
      {isLoading && (
        <motion.span
          variants={{
            loading: {
              opacity: 1,
            },
            idle: {
              opacity: 0,
            },
          }}
        >
          <Spinner
            className={cn(
              "absolute h-4 w-4 text-[var(--color-btn-spinner)]",
              isDisabled && disabledClass,
              className,
            )}
            style={{ marginLeft: "-11px" }}
          />
        </motion.span>
      )}
      <motion.span
        variants={{
          idle: {
            x: 0,
          },
          loading: {
            x: 11,
          },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
};

const ButtonWithLoader = forwardRef<HTMLButtonElement, IButton>(
  (
    {
      variant,
      disabled,
      onPress,
      className,
      children,
      isLoading = false,
      wrapperClass,
      loaderClass,
      disabledLoaderClass,
      ...props
    },
    ref,
  ) => {
    const control = useAnimationControls();

    const enterAnimation: AnimationDefinition = {
      scale: 0.98,
    };

    const leaveAnimation: AnimationDefinition = {
      scale: 1,
      transition: { duration: 0.4 },
    };

    const handleClick = (e: PressEvent) => {
      if (!isLoading && onPress) {
        onPress(e);
      }
    };

    return (
      <motion.div animate={control} className={cn("w-max", wrapperClass)}>
        <Btn
          ref={ref}
          onPressStart={() => {
            if (!isLoading) {
              control.stop();
              control.start(enterAnimation);
            }
          }}
          onPressEnd={() => {
            if (!isLoading) {
              control.start(leaveAnimation);
            }
          }}
          onPress={handleClick}
          isDisabled={disabled || isLoading}
          className={cn(
            "relative [--border-highlight-radius:var(--radius-xl)]",
            ButtonVariants({ variant, className }),
          )}
          {...props}
          aria-disabled={disabled || isLoading}
        >
          {variant !== "ghost" && variant !== "unstyled" && (
            <BorderHighligher />
          )}
          <Loader
            className={loaderClass}
            isDisabled={disabled || isLoading}
            isLoading={isLoading}
            disabledClass={disabledLoaderClass}
          >
            {children}
          </Loader>
        </Btn>
      </motion.div>
    );
  },
);

// Basic button without loader
const Button = forwardRef<HTMLButtonElement, IButton>(
  (
    {
      variant,
      disabled,
      onPress,
      className,
      children,
      isLoading = false,
      wrapperClass,
      ...props
    },
    ref,
  ) => {
    const control = useAnimationControls();

    const enterAnimation: AnimationDefinition = {
      scale: 0.97,
    };

    const leaveAnimation: AnimationDefinition = {
      scale: 1,
      transition: { duration: 0.4 },
    };

    const handleClick = (e: PressEvent) => {
      if (!isLoading && onPress) {
        onPress(e);
      }
    };

    return (
      <motion.div animate={control} className={cn("w-max", wrapperClass)}>
        <Btn
          ref={ref}
          onPressStart={() => {
            if (!isLoading) {
              control.stop();
              control.start(enterAnimation);
            }
          }}
          onPressEnd={() => {
            if (!isLoading) {
              control.start(leaveAnimation);
            }
          }}
          onPress={handleClick}
          isDisabled={disabled || isLoading}
          className={cn("relative", ButtonVariants({ variant, className }))}
          {...props}
          aria-disabled={disabled || isLoading}
        >
          {variant !== "ghost" && variant !== "unstyled" && (
            <BorderHighligher />
          )}
          {children}
        </Btn>
      </motion.div>
    );
  },
);

ButtonWithLoader.displayName = "ButtonWithLoader";
Button.displayName = "Button";

export { Button, ButtonWithLoader };

interface IBorderHighligher extends ComponentProps<"div"> {}
const BorderHighligher = ({ className }: IBorderHighligher) => {
  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--border-highlight-radius)]",
          className,
        )}
      >
        <div className="size-full rounded-[var(--border-highlight-radius)] border-t-2 border-white/20"></div>
      </span>
      <span
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--border-highlight-radius)]",
          className,
        )}
      >
        <div className="size-full rounded-[var(--border-highlight-radius)] border border-t-0 border-white/10"></div>
      </span>
    </>
  );
};
