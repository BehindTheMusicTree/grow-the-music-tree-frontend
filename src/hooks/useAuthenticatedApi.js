"use client";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ErrorCode } from "@contexts/error-codes";

/**
 * Creates an authenticated fetch function with auth headers pre-applied
 *
 * @param {Object} session - The authenticated session with accessToken
 * @returns {Function} - Enhanced fetch function with auth headers
 */
function createAuthFetch(session) {
  return async (endpoint, options = {}) => {
    // Extract special options
    const { resolveOnError, ...fetchOptions } = options;

    // Build headers with auth
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      ...fetchOptions.headers,
    };

    // Ensure the base URL is available
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      const error = new Error("API base URL is not configured");
      error.name = "ConfigurationError";
      throw error;
    }

    // Make the request with auth headers
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle common error cases unless resolveOnError is true
    if (!response.ok && !resolveOnError) {
      const error = new Error(`API request failed with status ${response.status}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  };
}

/**
 * Hook that wraps an API service function with authentication and error handling
 *
 * @param {Function} serviceFn - The API service function to wrap
 * @returns {Function} - Wrapped function that handles auth and errors
 */
export function useAuthenticatedApi(serviceFn) {
  const { setConnectivityError, ConnectivityErrorType } = useConnectivityError();
  const { data: session } = useSession();

  return async (...args) => {
    try {
      if (!session?.accessToken) {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH_REQUIRED,
          message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
        return { success: false, error: { message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED) } };
      }

      const authFetch = createAuthFetch(session);
      const result = await serviceFn(authFetch, ...args);
      return { success: true, data: result };
    } catch (error) {
      if (error?.message === "Unauthorized" || error?.status === 401) {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH_REQUIRED,
          message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
        return { success: false, error: { message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED) } };
      }

      if (error?.name === "TypeError" && error?.message === "Failed to fetch") {
        setConnectivityError({
          type: ConnectivityErrorType.INTERNAL,
          message: ErrorCode.getMessage(ErrorCode.INTERNAL),
          code: ErrorCode.INTERNAL,
        });
        return { success: false, error: { message: ErrorCode.getMessage(ErrorCode.INTERNAL) } };
      }

      console.error("API error:", error);
      throw error;
    }
  };
}
