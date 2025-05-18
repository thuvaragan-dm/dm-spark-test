import { useApi } from "../../providers/ApiProvider";
import { useAuthActions } from "../../store/authStore";
import { useCreateMutation } from "../apiFactory";
import { UpdateUserInput, User } from "./types";

export const useUpdateUser = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();
  const { setUser } = useAuthActions();

  return useCreateMutation<
    Record<string, unknown>,
    UpdateUserInput,
    User,
    User
  >({
    apiClient,
    method: "put",
    url: "users/me",
    errorMessage: "Failed to update user.",
    invalidateQueryKey,
    mutationOptions: {
      onSettled: async (user) => {
        setUser(user ?? null);
      },
    },
    optimisticUpdate: (user, variables) => {
      return user ? { ...user, ...variables } : user;
    },
  });
};
