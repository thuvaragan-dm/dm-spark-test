import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { GenerateAvatarInput, User } from "./types";

export const useGenerateAvatar = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { formDataApiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    GenerateAvatarInput,
    User,
    User
  >({
    apiClient: formDataApiClient,
    method: "put",
    url: "/users/me/avatar",
    errorMessage: "Failed to generate avatar.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
