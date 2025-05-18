import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Thread, ThreadInput } from "./types";

export const useCreateThread = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    Record<string, unknown>,
    ThreadInput,
    Thread,
    Thread[]
  >({
    apiClient,
    method: "post",
    url: "/threads",
    errorMessage: "Failed to create thread.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
