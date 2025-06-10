import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { User } from "./types";
import { ChangePasswordInput } from "./UserSchema";

export const useChangePassword = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    ChangePasswordInput,
    User,
    User
  >({
    apiClient,
    method: "put",
    url: "/users/me/password_change",
    errorMessage: "Failed to change user password.",
    invalidateQueryKey,
  });
};
