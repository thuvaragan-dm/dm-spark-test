import { useApi } from "../../providers/ApiProvider";
import { useCreateQuery } from "../apiFactory";
import { EDocument, documentKey } from "./config";

export const useDownloadDocument = (id: string) => {
  const { arrayBufferApiClient } = useApi();

  return useCreateQuery<ArrayBuffer>({
    queryKey: documentKey[EDocument.DOWNLOAD] + id,
    apiClient: arrayBufferApiClient,
    url: `/documents/${id}/download`,
    //errorMessage: "Failed to download document.",
    queryOptions: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });
};
