import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError, AxiosInstance, AxiosResponse, isAxiosError } from "axios";
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
      }
    );
  },
};

type HttpMethod = "post" | "put" | "patch" | "delete";

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
    params?: TParams
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
  TOptimisticData = unknown
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
    { params?: TParams; body?: TBody }, // Update mutation function to expect this
    MutationContext<TOptimisticData>
  >({
    mutationFn: async ({ params, body }) => {
      // Handle dynamic URL parts with variable replacement using params
      const finalUrl = url.replace(/\${(.*?)}/g, (_, key) => {
        const paramValue = params?.[key];
        if (!paramValue) {
          throw new Error(`Missing parameter for URL: ${key}`);
        }
        return paramValue;
      });

      try {
        const response: AxiosResponse<TData> = await apiClient({
          url: finalUrl,
          method,
          data: body,
        });

        return response.data;
      } catch (error) {
        if (isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (
            axiosError.response?.status !== 401 &&
            axiosError.response?.status !== 403
          ) {
            const errMessage =
              typeof errorMessage === "function"
                ? errorMessage(axiosError)
                : errorMessage || "An error occurred";

            if (errMessage) {
              toastService.error(errMessage);
            }
          }
        }
        throw error;
      }
    },

    onMutate: async (variables): Promise<MutationContext<TOptimisticData>> => {
      if (invalidateQueryKey && optimisticUpdate) {
        // Cancel any outgoing refetch
        // (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: invalidateQueryKey,
        });

        // Snapshot the previous value
        const previousData =
          queryClient.getQueryData<TOptimisticData>(invalidateQueryKey);

        // Optimistically update to the new value
        if (previousData) {
          queryClient.setQueryData<TOptimisticData>(invalidateQueryKey, (pv) =>
            optimisticUpdate(pv, variables.body!, variables.params)
          );
        }

        return { previousData };
      }
      return undefined;
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (invalidateQueryKey && context?.previousData !== undefined) {
        queryClient.setQueryData<TOptimisticData>(
          invalidateQueryKey,
          context.previousData
        );
      }
      if (mutationOptions?.onError) {
        mutationOptions.onError(err, variables, context);
      }
    },

    onSettled: async () => {
      if (invalidateQueryKey) {
        await queryClient.invalidateQueries({
          queryKey: invalidateQueryKey,
        });
      }
    },
    ...mutationOptions,
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
      TData,
      AxiosError,
      InfiniteData<TData>,
      TData,
      unknown[],
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
  TQueryParams = Record<string, any>
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
    keysToRemove
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
  keysToRemove: string[]
): Partial<T> => {
  const tempObject = { ...object }; // Shallow copy of the object

  keysToRemove.forEach((key) => {
    delete tempObject[key as keyof T]; // Remove the key from the object
  });

  return tempObject; // Return the modified object
};
