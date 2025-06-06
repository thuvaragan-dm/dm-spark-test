import { useApi } from "../../providers/ApiProvider";
import { PaginatedResult } from "../../types/type-utils";
import { useCreateMutation } from "../apiFactory";
import {
  ConnectedMCPConnectionItem,
  ConnectedMCPGroup,
  UpdateMCPConnectionInput,
} from "./types";

export const useUpdateMCPConnection = ({
  invalidateQueryKey,
}: {
  invalidateQueryKey?: unknown[];
}) => {
  const { apiClient } = useApi();

  return useCreateMutation<
    { id: string },
    UpdateMCPConnectionInput,
    ConnectedMCPConnectionItem,
    PaginatedResult<ConnectedMCPGroup>
  >({
    apiClient,
    method: "patch",
    url: "/mcp-connections/${id}",
    errorMessage: "Failed to update mcp connection.",
    invalidateQueryKey,
    mutationOptions: {},
  });
};
