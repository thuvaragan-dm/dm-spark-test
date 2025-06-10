import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EUser, userKey } from "./config";
import { User } from "./types";

export const useGetUser = () => {
  const { apiClient } = useApi();

  return useCreateQuery<User>({
    queryKey: userKey[EUser.FETCH_SINGLE],
    apiClient,
    url: "/users/me",
    //errorMessage: "Failed to fetch user.",
  });
};
