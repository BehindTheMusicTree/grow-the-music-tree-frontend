import { useState, useCallback } from "react";

export function useFetchErrorHandler() {
  const [error, setError] = useState(null);

  const handleFetchError = useCallback((error) => {
    const status = error?.response?.status;
    const isExternalService = error?.config?.url?.includes("spotify") || error?.config?.url?.includes("oauth");

    if (status === 404 || status === 500) {
      setError({
        title: status === 404 ? "Resource Not Found" : "Server Error",
        message: isExternalService
          ? "The external service is currently unavailable. Please try again later."
          : status === 404
          ? "The requested resource could not be found. Please refresh the page to try again."
          : "An unexpected error occurred. Please refresh the page to try again.",
      });
    }
  }, []);

  return {
    handleFetchError,
    error,
    clearError: () => setError(null),
  };
}
