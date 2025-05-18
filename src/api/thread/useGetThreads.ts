import { useApi } from "../../providers/ApiProvider";
import { useCreateInfiniteQuery } from "../apiFactory";
import { Thread, ThreadParams } from "./types";

const DEAFULT_PAGE_LIMIT = 10;

export const useGetThreads = ({
  queryKey,
  params,
}: {
  queryKey: string;
  params: ThreadParams;
}) => {
  const { apiClient } = useApi();

  return useCreateInfiniteQuery<Thread[]>({
    queryKey,
    apiClient,
    url: `/threads/`,
    errorMessage: "Failed to fetch threads.",
    queryParams: params,
    initialPageParam: 0, // Initial page number or cursor
    getNextPageParam: (lastPage, allPages) => {
      // If the last page is empty, there are no more messages
      if (lastPage.length < (params?.limit || DEAFULT_PAGE_LIMIT)) {
        return undefined;
      }

      // Calculate the next offset
      const nextOffset =
        Math.max(allPages.length, 1) * (params?.limit || DEAFULT_PAGE_LIMIT);

      // Return the next offset for the next page
      return nextOffset;
    },
  });
};
