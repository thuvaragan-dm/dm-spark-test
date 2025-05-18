import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateQuery } from "../apiFactory";
import { EDocument, documentKey } from "./config";
import { DocumentSearchResult, SearchDocumentParams } from "./types";

export const useSearchDocuments = (params?: SearchDocumentParams) => {
  const { apiClient } = useApi();

  return useCreateQuery<PaginatedResult<DocumentSearchResult>>({
    queryKey: documentKey[EDocument.SEARCH],
    apiClient,
    url: `/documents/search`,
    errorMessage: "Failed to search document.",
    queryParams: params,
  });
};
