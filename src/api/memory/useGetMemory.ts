import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EMemory, memoryKey } from "./config";
import { Memory, MemoryParams } from "./types";

export const useGetMemory = ({
  id,
  params,
}: {
  id: string;
  params?: MemoryParams;
}) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<Memory>>({
    queryKey: memoryKey[EMemory.FETCH_ALL],
    apiClient,
    url: `/shards/${id}/documents`,
    queryParams: params,
    queryOptions: {
      enabled: !!id,
    },
  });
};
