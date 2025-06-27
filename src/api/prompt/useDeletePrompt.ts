import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import queryClient from "../queryClient";
import { EPrompt, promptKey } from "./config";
import { Prompt } from "./types";

export const useDeletePrompt = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    unknown,
    unknown,
    PaginatedResult<Prompt>
  >({
    apiClient,
    method: "delete",
    url: "/prompts/${id}",
    errorMessage: "Failed to delete prompt.",
    invalidateQueryKey,
    mutationOptions: {
      onSuccess: () => {
        const promptsOptions = {
          search: "",
          page: 1,
          records_per_page: 20,
        };

        queryClient.invalidateQueries({
          queryKey: [promptKey[EPrompt.FETCH_ALL], promptsOptions],
        });
        queryClient.invalidateQueries({
          queryKey: [promptKey[EPrompt.FETCH_CREATED_BY_YOU], promptsOptions],
        });
        queryClient.invalidateQueries({
          queryKey: [promptKey[EPrompt.FETCH_SHARED_WITH_YOU], promptsOptions],
        });
      },
    },
    optimisticUpdate: (oldData, _newData, params) => {
      if (!params || !oldData) return oldData;

      return {
        ...oldData,
        items: oldData.items.filter((prompt) => prompt.id !== params.id),
        total: oldData.total - 1,
      };
    },
  });
};
