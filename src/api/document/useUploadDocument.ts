import { useApi } from "../../providers/ApiProvider";
import { useCreateMutation } from "../apiFactory";
import { Document, DocumentInput } from "./types";

export const useUploadDocument = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { formDataApiClient } = useApi();

  return useCreateMutation<
    Record<string, any>,
    DocumentInput,
    Document,
    Document[]
  >({
    apiClient: formDataApiClient,
    method: "post",
    url: "/documents/upload",
    errorMessage: "Failed to upload document.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
