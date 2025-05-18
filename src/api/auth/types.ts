import { z } from "zod";
import {
  ActivateUserSchema,
  ForgotPasswordSchema,
  LoginSchema,
  PersonalInformationSchema,
  SignUpSchema,
  ResetPasswordSchema,
  SetupYourProfileSchema,
  UseCaseSchema,
} from "./AuthSchema";
import { User } from "../user/types";

export enum AuthProvider {
  GOOGLE = 1,
  MICROSOFT = 2,
}

export type AuthProviderInput = {
  provider: AuthProvider;
};

export type TokenResponse = {
  access_token?: string;
};

export type UserResponse = {
  user: User;
};

export type LoginResponse = TokenResponse & UserResponse;
export type SignUpResponse = { token: TokenResponse } & UserResponse;

export type UseAuthProps = {
  redirect_to: string | null;
};

export type SignUpInput = z.infer<typeof SignUpSchema>;

export type LoginInput = z.infer<typeof LoginSchema>;

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export type ResetInput = {
  new_password: string;
  password_reset_token: string;
  username: string;
};

export type PersonalInformationInput = z.infer<
  typeof PersonalInformationSchema
>;
export type UseCaseInput = z.infer<typeof UseCaseSchema>;

export type AddUseCase = {
  metadata_fields: UseCaseInput;
};
export type SetupYourProfileInput = z.infer<typeof SetupYourProfileSchema>;

export type ActivateUserInput = z.infer<typeof ActivateUserSchema>;

export type ActivateInvitedUser = {
  id: string;
  email: string;
};

export type ActivateInvitedUserPayload = {
  activation_token: string;
  password: string;
};

export type ActivateUserPayload = {
  activation_token: string;
};
