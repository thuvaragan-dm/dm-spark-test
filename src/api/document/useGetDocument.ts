import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EDocument, documentKey } from "./config";
import { Document, GetDocumentParams } from "./types";

export const useGetDocument = (id: string, params?: GetDocumentParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<Document>({
    queryKey: documentKey[EDocument.FETCH_SINGLE] + id,
    apiClient,
    url: `/documents/${id}`,
    //errorMessage: "Failed to fetch document.",
    queryOptions: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
    queryParams: params,
  });
};
