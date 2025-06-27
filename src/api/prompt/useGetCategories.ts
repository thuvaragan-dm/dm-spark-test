import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EPrompt, promptKey } from "./config";

export const useGetCategories = () => {
  const { apiClient } = useApi();

  return useCreateQuery<string[]>({
    queryKey: promptKey[EPrompt.FETCH_CATEGORIES],
    apiClient,
    url: "/prompts/categories",
  });
};
