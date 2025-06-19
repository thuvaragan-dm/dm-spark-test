import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { academyKey, EAcademy } from "./config";
import { Catalog } from "./types";

export const useGetAcademy = () => {
  const { apiClient } = useApi();

  return useCreateQuery<{ catalog: Catalog }>({
    queryKey: academyKey[EAcademy.FETCH_ALL],
    apiClient,
    url: "/academy-guide",
  });
};
