import axios, {
  AxiosError,
  AxiosHeaderValue,
  AxiosInstance,
  RawAxiosRequestHeaders,
  ResponseType,
} from "axios";
import { toast } from "sonner";
import Error from "../components/alerts/Error";

type Headers =
  | Partial<
      RawAxiosRequestHeaders & {
        Accept: AxiosHeaderValue;
        "Content-Length": AxiosHeaderValue;
        "User-Agent": AxiosHeaderValue;
        "Content-Encoding": AxiosHeaderValue;
        Authorization: AxiosHeaderValue;
        "Content-Type": string;
      }
    >
  | undefined;

export type ApiClientOptions = {
  headers?: Headers;
  responseType: ResponseType;
};

const toastService = {
  error: (message: string) => {
    toast.custom((t) => <Error t={t} title="Error" description={message} />, {
      id: "baseApiError",
    });
  },
};

export const createApiClient = (
  baseURL: string,
  getAccessToken: () => string | null,
  logout: () => void,
  options: ApiClientOptions = { responseType: "json" }
): AxiosInstance => {
  const api = axios.create({
    baseURL,
    headers: options.headers ?? {
      "Content-Type": "application/json",
    },
    responseType: options.responseType,
  });

  api.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        logout();

        const path = window.location.pathname;
        const query = window.location.search;

        const fullPath = path + query;

        if (fullPath.length > 3) {
          window.location.href = `/login?redirect_to=${encodeURIComponent(
            fullPath
          )}`;
        } else {
          window.location.href = `/login`;
        }

        toastService.error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 403) {
        toastService.error(
          "You do not have permission to perform this action."
        );
      } else if (error.response?.status === 400) {
        const message = error.response?.data as { detail: string };
        if (message?.detail.includes("invalid login")) {
          toastService.error("Please try again with another provider.");
        }
      } else if (error.response?.status === 500) {
        toastService.error("Something went wrong.");
      }
      return Promise.reject(error);
    }
  );

  return api;
};
