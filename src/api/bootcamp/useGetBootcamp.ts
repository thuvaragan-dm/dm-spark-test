import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { bootcampKey, EBootcamp } from "./config";
import { Catalog } from "./types";

export const useGetBootcamp = () => {
  const { apiClient } = useApi();

  return useCreateQuery<{ catalog: Catalog }>({
    queryKey: bootcampKey[EBootcamp.FETCH_ALL],
    apiClient,
    url: "/academy-guide",
  });
};
