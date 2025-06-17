import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { configKey, EConfigurations } from "./config";

export const useGetChangelog = (params: { version: string }) => {
  const { apiClient } = useApi();

  return useCreateQuery<string>({
    queryKey: configKey[EConfigurations.FETCH_CHANGELOG] + params.version,
    apiClient,
    url: `/deepmodel-app-changelog/v${params.version}`,
  });
};
