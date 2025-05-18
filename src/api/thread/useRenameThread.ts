import { InfiniteData } from "@tanstack/react-query";
import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { RenameThreadInput, Thread } from "./types";

export const useRenameThread = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    RenameThreadInput,
    Thread,
    InfiniteData<Thread[]>
  >({
    apiClient,
    method: "put",
    url: "/threads/${id}",
    errorMessage: "Failed to rename thread.",
    invalidateQueryKey: [invalidateQueryKey?.[0]],
    optimisticUpdate: (
      oldData = { pageParams: [], pages: [] },
      newData,
      params,
    ) => {
      if (!params) return oldData;

      if (oldData) {
        const updatedPages = oldData.pages.map((page) => {
          page.map((thread) => {
            if (thread.id === params.id) {
              thread.title = newData.title;
              thread.updated_at = new Date().toISOString();
            }
            return thread;
          });
          return page;
        });

        return { ...oldData, pages: updatedPages };
      }
    },
  });
};
