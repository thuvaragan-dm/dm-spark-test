import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface AppendToSearchQueryOptions {
  useReplace?: boolean; // Changed to optional as default is false
}

/**
 * Custom hook to append or update search query parameters in the URL
 * using react-router-dom.
 *
 * @returns A function to update search query parameters.
 * This function takes:
 * - param: An object where keys are query parameter names and values are their string values.
 * - options: (Optional) An object with:
 * - useReplace: If true, replaces the current entry in the history stack;
 * otherwise, pushes a new entry (defaults to false).
 */
const useAppendToSearchQuery = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const location = useLocation(); // Hook to get current location (pathname, search, hash)

  return useCallback(
    (
      param: Record<string, string>,
      options: AppendToSearchQueryOptions = { useReplace: false },
    ) => {
      // Get current search parameters from react-router-dom's location object
      // location.search includes the leading '?' (e.g., "?foo=bar")
      const currentSearchParams = new URLSearchParams(location.search);

      // Update or add new parameters
      Object.entries(param).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          // Optionally remove the parameter if the value is empty/null/undefined
          currentSearchParams.delete(key);
        } else {
          currentSearchParams.set(key, value);
        }
      });

      // Construct the new search string
      const newSearchString = currentSearchParams.toString();

      // Create the new path including the updated search string.
      // If newSearchString is empty, we don't want a trailing '?'
      const newPath = newSearchString
        ? `${location.pathname}?${newSearchString}`
        : location.pathname;

      // Perform navigation
      navigate(newPath, { replace: options.useReplace });
    },
    [navigate, location.search, location.pathname], // Dependencies for useCallback
  );
};

export default useAppendToSearchQuery;
