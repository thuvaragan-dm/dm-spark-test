import { z } from "zod";

export const SignUpSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required." })
      .trim()
      .min(1, "Email is required.")
      .email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be more than 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one numeric digit.",
      })
      .regex(/[@$!%*?&#]/, {
        message: "Password must contain at least one special character.",
      }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const LoginSchema = z.object({
  username: z
    .string({ required_error: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .email({ message: "Invalid email address." }),
  password: z
    .string({ required_error: "Password is required." })
    .trim()
    .min(1, "Password is required."),
});

export const ForgotPasswordSchema = z.object({
  username: z
    .string({ required_error: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .email({ message: "Invalid email address." }),
});

export const ResetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, { message: "Password must be more than 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one numeric digit.",
      })
      .regex(/[@$!%*?&#]/, {
        message: "Password must contain at least one special character.",
      }),
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match.",
    path: ["confirm_new_password"],
  });

export const ActivateUserSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be more than 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one numeric digit.",
      })
      .regex(/[@$!%*?&#]/, {
        message: "Password must contain at least one special character.",
      }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const PersonalInformationSchema = z.object({
  first_name: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(1, "First name is required."),
  last_name: z
    .string({ required_error: "Last name is required." })
    .trim()
    .min(1, "Last name is required."),
});

export const UseCaseSchema = z.object({
  use_case: z.string().trim().min(1, "Use case is required.").optional(),
  other: z.string().trim().optional(),
});

export const SetupYourProfileSchema = PersonalInformationSchema.merge(
  UseCaseSchema,
)
  .superRefine((data, ctx) => {
    // Validate that 'other' is provided when use_case is "other"
    if (data.use_case === "other" && (!data.other || data.other.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Other use case is required.",
        path: ["other"],
      });
    }
  })
  .transform((data) => {
    // Clear 'other' if use_case is not "other"
    if (data.use_case !== "other") {
      return { ...data, other: "" };
    }
    return data;
  });
