import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type AppendParams = Record<string, string>;

type Options = {
  useReplace?: boolean;
};

const useSearchQuery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const updateSearchQuery = useCallback(
    (params: URLSearchParams, options: Options = { useReplace: false }) => {
      const currentUrl = new URL(window.location.href);
      const url = `${currentUrl.pathname}?${params.toString()}`;

      if (options.useReplace) {
        navigate(url, { replace: true });
      } else {
        navigate(url);
      }
    },
    [navigate],
  );

  const appendToSearchQuery = useCallback(
    (param: AppendParams, options: Options = { useReplace: false }) => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);

      Object.entries(param).forEach(([key, value]) => {
        params.set(key, value);
      });

      updateSearchQuery(params, options);
    },
    [updateSearchQuery],
  );

  const deleteFromSearchQuery = useCallback(
    (paramKey: string, options: Options = { useReplace: false }) => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);

      params.delete(paramKey);

      updateSearchQuery(params, options);
    },
    [updateSearchQuery],
  );

  const batchUpdateSearchQuery = useCallback(
    (
      appendParams?: AppendParams,
      deleteParams?: string[],
      options: Options = { useReplace: false },
    ) => {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);

      if (appendParams) {
        Object.entries(appendParams).forEach(([key, value]) => {
          params.set(key, value);
        });
      }

      if (deleteParams) {
        deleteParams.forEach((key) => {
          params.delete(key);
        });
      }

      updateSearchQuery(params, options);
    },
    [updateSearchQuery],
  );

  return {
    searchParams,
    appendToSearchQuery,
    deleteFromSearchQuery,
    batchUpdateSearchQuery,
  };
};

export default useSearchQuery;
