import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { blueprintKey, EBlueprint } from "./config";
import { AgentBlueprint } from "./types";

export const useGetBlueprint = (params: { id: string }) => {
  const { apiClient } = useApi();

  return useCreateQuery<AgentBlueprint>({
    queryKey: blueprintKey[EBlueprint.FETCH_SINGLE],
    apiClient,
    url: `/agent-blueprint/${params.id}`,
    queryOptions: {
      enabled: !!params.id,
    },
  });
};
