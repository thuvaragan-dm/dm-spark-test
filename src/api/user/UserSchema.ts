import { z } from "zod";
import { UserRole, UserStatus } from "./types";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone_number: z
    .string()
    .nullable()
    .superRefine((phoneNumber, ctx) => {
      if (phoneNumber) {
        // Check if phone number contains spaces
        if (/\s/.test(phoneNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number must not contain spaces.",
            path: [],
          });
        }

        // Check if phone number starts with '+1'
        if (phoneNumber.startsWith("+1")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number should not start with '+1'.",
            path: [],
          });
        }

        // Check if the phone number has exactly 10 digits
        if (phoneNumber.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number must be exactly 10 digits.",
            path: [],
          });
        }

        // Check if the phone number follows the valid US format
        if (!/^[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/.test(phoneNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Invalid US phone number format (Area code and exchange code can't start with 1).",
            path: [],
          });
        }
      }
    }),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  status: z.enum(UserStatus),
  role: z.enum(UserRole),
  avatar_url: z.string().url().nullable(),
  original_profile_picture_url: z.string().url().nullable(),
  is_phone_communication_opted: z.boolean(),
  is_avatar_enabled: z.boolean(),
  metadata_fields: z.record(z.unknown()),
});

export const ChangePasswordSchema = z
  .object({
    current_password: z
      .string({ required_error: "Password is required." })
      .min(8, "Password must be at least 8 characters long.")
      .regex(
        /.*[!@#$%^&*()_+{}[\]:;"'<>,.?~`].*/,
        "Password must contain at least one special character.",
      ),

    new_password: z
      .string({ required_error: "New password is required." })
      .min(8, "New password must be at least 8 characters long.")
      .regex(
        /.*[!@#$%^&*()_+{}[\]:;"'<>,.?~`].*/,
        "New password must contain at least one special character.",
      ),

    confirm_password: z
      .string({ required_error: "Confirm password is required." })
      .min(8, "Confirm password must be at least 8 characters long.")
      .regex(
        /.*[!@#$%^&*()_+{}[\]:;"'<>,.?~`].*/,
        "Confirm password must contain at least one special character.",
      ),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords must match.",
    path: ["confirm_password"],
  });

export const UpdateUserSchema = userSchema.partial().omit({ id: true });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
