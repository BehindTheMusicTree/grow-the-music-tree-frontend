import { useCallback } from "react";

/**
 * Custom hook for handling API connectivity issues
 * Integrates with server availability tracking and auth state
 * to provide unified error handling and display
 *
 * @returns {Object} Connectivity utilities and handlers
 */
export default function useApiConnectivity() {
  const handleApiError = useCallback((error, endpoint) => {
    if (error.status === 401 || error.name === "UnauthorizedRequestError") {
      return { isAuthError: true };
    }

    const isConnectivityError =
      error.status === 404 ||
      error.status === 500 ||
      (error.status >= 502 && error.status <= 504) ||
      error.name === "TypeError" ||
      error.message?.includes("Failed to fetch");

    if (isConnectivityError) {
      return {
        isConnectivityError: true,
        message: "The server is unavailable. Please refresh the page to try again.",
        endpoint,
      };
    }

    return { isOtherError: true };
  }, []);

  return {
    handleApiError,
  };
}
