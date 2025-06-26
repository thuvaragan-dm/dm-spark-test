import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { blueprintKey, EBlueprint } from "./config";
import { AgentBlueprint, BlueprintsParams } from "./types";

export const useGetBlueprints = (params?: BlueprintsParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<AgentBlueprint>>({
    queryKey: blueprintKey[EBlueprint.FETCH_ALL],
    apiClient,
    url: "/agent-blueprint",
    queryParams: params,
  });
};
