import { z } from "zod";
import { UpdateUserSchema } from "./UserSchema";

export const UserStatus = [
  "ACTIVE",
  "INVITED",
  "PENDING_VERIFICATION",
  "DEACTIVATED",
  "PENDING_VERIFICATION",
] as const;
export const UserRole = ["ADMIN", "CONTRIBUTOR", "CONSUMER"] as const;

export type User = {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  status: (typeof UserStatus)[number];
  role: (typeof UserRole)[number];
  avatar_url: string | null;
  original_profile_picture_url: string | null;
  is_phone_communication_opted: boolean;
  is_avatar_enabled: boolean;
  metadata_fields: {
    use_case?: string | null;
    other?: string | null;
  };
  created_at: string;
  login_method: "EMAIL" | "GOOGLE_OAUTH" | "MICROSOFT_OAUTH";
};

export interface GenerateAvatarInput {
  uploaded_picture?: File;
  regenerate_avatar: boolean;
}

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
