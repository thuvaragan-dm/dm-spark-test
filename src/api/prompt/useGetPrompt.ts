import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EPrompt, promptKey } from "./config";
import { Prompt } from "./types";

export const useGetPrompt = ({ id }: { id: string }) => {
  const { apiClient } = useApi();

  return useCreateQuery<Prompt>({
    queryKey: promptKey[EPrompt.FETCH_SINGLE] + id,
    apiClient,
    url: "/prompts",
    errorMessage: "Failed to fetch prompt.",
    queryOptions: {
      enabled: !!id,
    },
  });
};
