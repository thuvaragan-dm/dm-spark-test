import React, { createContext, useCallback, useContext, useMemo } from "react";
import { createApiClient } from "../api/baseApi";
import { useAuth, useAuthActions } from "../store/authStore";
import { apiUrl } from "../api/variables";

interface ApiContextType {
  apiClient: ReturnType<typeof createApiClient>;
  formDataApiClient: ReturnType<typeof createApiClient>;
  arrayBufferApiClient: ReturnType<typeof createApiClient>;
  blobApiClient: ReturnType<typeof createApiClient>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export const ApiProvider: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  const { accessToken } = useAuth();
  const { logout } = useAuthActions();

  const getAccessToken = useCallback(() => accessToken ?? null, [accessToken]);

  const apiClient = useMemo(
    () => createApiClient(apiUrl ?? "", getAccessToken, logout),
    [getAccessToken, logout],
  );

  const formDataApiClient = useMemo(
    () =>
      createApiClient(apiUrl ?? "", getAccessToken, logout, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json",
      }),
    [getAccessToken, logout],
  );

  const arrayBufferApiClient = useMemo(
    () =>
      createApiClient(apiUrl ?? "", getAccessToken, logout, {
        responseType: "arraybuffer",
      }),
    [getAccessToken, logout],
  );

  const blobApiClient = useMemo(
    () =>
      createApiClient(apiUrl ?? "", getAccessToken, logout, {
        responseType: "blob",
      }),
    [getAccessToken, logout],
  );

  return (
    <ApiContext.Provider
      value={{
        apiClient,
        formDataApiClient,
        arrayBufferApiClient,
        blobApiClient,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useAPI must be used within an APIProvider");
  }
  return context;
};
