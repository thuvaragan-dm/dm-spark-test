import { InfiniteData } from "@tanstack/react-query";
import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Thread } from "./types";

export const useDeleteThread = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    unknown,
    unknown,
    InfiniteData<Thread[]>
  >({
    apiClient,
    method: "delete",
    url: "/threads/${id}",
    errorMessage: "Failed to delete thread.",
    invalidateQueryKey,
    mutationOptions: {},
    optimisticUpdate: (
      oldData = { pageParams: [], pages: [] },
      _newData,
      params,
    ) => {
      if (!params) return oldData;

      if (oldData) {
        const updatedPages = oldData.pages.map((page) =>
          page.filter((thread) => thread.id !== params.id),
        );

        return { ...oldData, pages: updatedPages };
      }
    },
  });
};
