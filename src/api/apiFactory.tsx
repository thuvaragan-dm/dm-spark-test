import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  CanceledError,
  isAxiosError,
} from "axios";
import queryClient from "./queryClient";
import { toast } from "sonner";
import ErrorAlert from "../components/alerts/Error";

// Toast service for displaying errors
const toastService = {
  error: (message: string) => {
    toast.custom(
      (t) => <ErrorAlert t={t} title="Error" description={message} />,
      {
        id: "apiFactory",
      },
    );
  },
};

type HttpMethod = "post" | "put" | "patch" | "delete" | "get";

// Mutation context to store previous data for rollback in case of failure
export type MutationContext<TOptimisticData> =
  | {
      previousData: TOptimisticData | undefined;
    }
  | undefined;

interface CreateMutationParams<TData, TParams, TBody, TOptimisticData> {
  apiClient: AxiosInstance;
  method: HttpMethod;
  url: string; // URL can have dynamic parts (e.g., `/api/resource/${id}`)
  optimisticUpdate?: (
    previousValue: TOptimisticData | undefined,
    variables: TBody,
    params?: TParams,
  ) => TOptimisticData | undefined;
  errorMessage?: string | ((error: AxiosError) => string | null);
  invalidateQueryKey?: unknown[];
  mutationOptions?: Omit<
    UseMutationOptions<
      TData,
      AxiosError,
      { params?: TParams; body?: TBody }, // TVariables now has params and body
      MutationContext<TOptimisticData>
    >,
    "mutationFn"
  >;
}

export function useCreateMutation<
  TParams extends Record<string, any> = Record<string, any>,
  TBody = unknown,
  TData = unknown,
  TOptimisticData = unknown,
>({
  apiClient,
  method,
  url,
  optimisticUpdate,
  errorMessage,
  invalidateQueryKey,
  mutationOptions,
}: CreateMutationParams<TData, TParams, TBody, TOptimisticData>) {
  return useMutation<
    TData,
    AxiosError,
    { params?: TParams; body?: TBody },
    MutationContext<TOptimisticData>
  >({
    mutationFn: async ({ params, body }) => {
      // Step 1: Substitute template variables in the URL.
      // This handles placeholders like ${id} in the path or query.
      const filledUrlTemplate = url.replace(/\${(.*?)}/g, (_, key) => {
        if (params && Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (value === undefined) {
            // If a placeholder is in the URL template but its value is undefined in params,
            // it's a critical missing piece for the URL.
            throw new Error(
              `Parameter '${key}' for URL template was undefined.`,
            );
          }
          // Convert null to an empty string; other values (like "" or actual values) are stringified.
          // Empty strings resulting from this will be handled in Step 2 if they are query parameters.
          return String(value === null ? "" : value);
        }
        // If params is not provided, or the key is not in params,
        // then a placeholder in the URL template cannot be filled.
        throw new Error(
          `Missing parameter '${key}' for URL template substitution. Ensure it's provided in 'params'.`,
        );
      });

      // Step 2: Process the URL to remove any query parameters that ended up with empty values.
      let finalUrl = filledUrlTemplate;
      const urlParts = filledUrlTemplate.split("?");

      if (urlParts.length > 1) {
        const basePath = urlParts[0];
        const queryString = urlParts[1];

        // Proceed only if there was a query string part or if the URL just ended with '?'
        if (queryString || filledUrlTemplate.endsWith("?")) {
          const currentSearchParams = new URLSearchParams(queryString);
          const newSearchParams = new URLSearchParams();
          for (const [key, value] of currentSearchParams) {
            if (value !== "") {
              // Only append parameters that have a non-empty value
              newSearchParams.append(key, value);
            }
          }
          const newQueryString = newSearchParams.toString();
          // Reconstruct the URL: if newQueryString is empty, just use basePath, otherwise append '?'.
          finalUrl = newQueryString
            ? `${basePath}?${newQueryString}`
            : basePath;
        }
        // If there was no '?' in filledUrlTemplate, finalUrl remains as is (basePath only).
      }

      // Step 3: Make the API call.
      try {
        const response: AxiosResponse<TData> = await apiClient({
          url: finalUrl, // Use the processed URL
          method,
          data: body,
        });
        return response.data;
      } catch (error) {
        if (error instanceof CanceledError) throw error;
        if (isAxiosError(error)) {
          const axiosError = error as AxiosError;
          // Avoid spamming toasts for auth errors, as they are often handled globally (e.g., redirect to login)
          if (
            axiosError.response?.status !== 401 &&
            axiosError.response?.status !== 403
          ) {
            const errMessage =
              typeof errorMessage === "function"
                ? errorMessage(axiosError)
                : errorMessage ||
                  (axiosError.response?.data as any)?.message || // Try to get server message
                  axiosError.message || // Fallback to Axios error message
                  "An unexpected error occurred.";

            if (errMessage) {
              // Ensure there's a message to display
              toastService.error(errMessage);
            }
          }
        }
        throw error; // Re-throw the error to be caught by react-query's onError
      }
    },

    onMutate: async (variables): Promise<MutationContext<TOptimisticData>> => {
      if (invalidateQueryKey && optimisticUpdate) {
        await queryClient.cancelQueries({
          queryKey: invalidateQueryKey,
        });
        const previousData =
          queryClient.getQueryData<TOptimisticData>(invalidateQueryKey);
        // Note: optimisticUpdate receives the original variables.body and variables.params
        // before any filtering that happens in mutationFn for URL construction.
        queryClient.setQueryData<TOptimisticData>(invalidateQueryKey, (pv) =>
          optimisticUpdate(pv, variables.body!, variables.params),
        );
        return { previousData };
      }
      return undefined;
    },

    onError: (err, variables, context) => {
      if (invalidateQueryKey && context?.previousData !== undefined) {
        queryClient.setQueryData<TOptimisticData>(
          invalidateQueryKey,
          context.previousData,
        );
      }
      // Call user-defined onError if provided
      if (mutationOptions?.onError) {
        mutationOptions.onError(err, variables, context);
      }
    },

    onSettled: async (data, error, variables, context) => {
      if (invalidateQueryKey) {
        await queryClient.invalidateQueries({
          queryKey: invalidateQueryKey,
        });
      }
      // Call user-defined onSettled if provided
      if (mutationOptions?.onSettled) {
        mutationOptions.onSettled(data, error, variables, context);
      }
    },
    ...mutationOptions, // Spread other react-query mutation options
  });
}

interface CreateQueryParams<TData> {
  apiClient: AxiosInstance;
  url: string; // URL can have dynamic parts (e.g., `/api/resource/${id}`)
  errorMessage?: string | ((error: AxiosError) => string);
  defaultValue?: TData;
  queryKey: string;
  queryParams?: Record<string, any>;
  queryOptions?: Omit<
    UseQueryOptions<TData, AxiosError, TData, unknown[]>,
    "queryFn" | "queryKey"
  >;
}

export function useCreateQuery<TData = unknown>({
  apiClient,
  url,
  errorMessage,
  defaultValue,
  queryKey,
  queryParams,
  queryOptions,
}: CreateQueryParams<TData>) {
  return useQuery<TData, AxiosError, TData, unknown[]>({
    queryKey: queryParams ? [queryKey, queryParams] : [queryKey],
    queryFn: async ({ signal }) => {
      try {
        const response: AxiosResponse<TData> = await apiClient({
          url,
          method: "get", // Query method will generally be GET
          params: queryParams, // For queries, params go in the URL instead of the body
          signal,
        });

        return response.data;
      } catch (error) {
        if (error instanceof CanceledError) throw error;
        if (errorMessage && error instanceof AxiosError) {
          const errMessage =
            typeof errorMessage === "function"
              ? errorMessage(error)
              : errorMessage || "An error occurred";

          if (errMessage) {
            toastService.error(errMessage);
          }
        }
        throw error;
      }
    },

    // Provide default data to avoid undefined issues
    initialData: defaultValue,

    ...queryOptions,
  });
}

export interface CreateInfiniteQueryParams<TData, TQueryParams> {
  apiClient: AxiosInstance;
  url: string;
  errorMessage?: string | ((error: AxiosError) => string);
  queryKey: string;
  queryParams?: TQueryParams;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      TData, // 1. TQueryFnData
      AxiosError, // 2. TError
      InfiniteData<TData>, // 3. TData
      unknown[], // 4. TQueryKey
      unknown
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >;
  getNextPageParam: (lastPage: TData, allPages: TData[]) => unknown | undefined;
  initialPageParam: unknown;
  keysToRemoveFromQueryParams?: (keyof TQueryParams)[];
}

export function useCreateInfiniteQuery<
  TData = unknown,
  TQueryParams = Record<string, any>,
>({
  apiClient,
  url,
  errorMessage,
  queryKey,
  queryParams,
  queryOptions,
  getNextPageParam,
  initialPageParam,
  keysToRemoveFromQueryParams = [],
}: CreateInfiniteQueryParams<TData, TQueryParams>) {
  const keysToRemove = keysToRemoveFromQueryParams.map(String);

  const filteredQueryParams = filterQueryParams(
    queryParams || {},
    keysToRemove,
  );

  return useInfiniteQuery<
    TData,
    AxiosError,
    InfiniteData<TData>,
    unknown[],
    unknown
  >({
    queryKey: queryParams
      ? Object.keys(filteredQueryParams).length > 0
        ? [queryKey, filteredQueryParams]
        : [queryKey]
      : [queryKey],
    queryFn: async ({ pageParam }) => {
      try {
        const updatedParams = {
          ...queryParams,
          offset: pageParam, // Use pageParam as the offset (or page, depending on your API)
        };

        const response: AxiosResponse<TData> = await apiClient({
          url,
          method: "get",
          params: updatedParams,
        });

        return response.data;
      } catch (error) {
        if (error instanceof CanceledError) throw error;
        if (errorMessage && error instanceof AxiosError) {
          const errMessage =
            typeof errorMessage === "function"
              ? errorMessage(error)
              : errorMessage || "An error occurred";

          if (errMessage) {
            toastService.error(errMessage);
          }
        }
        throw error;
      }
    },
    getNextPageParam,
    initialPageParam,
    ...queryOptions,
  });
}

const filterQueryParams = <T extends Record<string, any>>(
  object: T,
  keysToRemove: string[],
): Partial<T> => {
  const tempObject = { ...object }; // Shallow copy of the object

  keysToRemove.forEach((key) => {
    delete tempObject[key as keyof T]; // Remove the key from the object
  });

  return tempObject; // Return the modified object
};
