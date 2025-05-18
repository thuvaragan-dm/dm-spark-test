import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { User } from "../user/types";
import { EAuth, authKeys } from "./config";

export const useWhoAmI = () => {
  const { apiClient } = useApi();

  return useCreateQuery<User>({
    queryKey: authKeys[EAuth.GET_ME],
    apiClient,
    url: "users/me",
    errorMessage: "Failed to fetch user.",
  });
};
