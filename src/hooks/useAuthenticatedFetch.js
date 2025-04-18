"use client";

import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ErrorCode } from "@lib/error-codes";

/**
 * Standard response object for authentication errors
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {Object} data - The operation result data (if successful)
 * @property {Object} error - Error information (if not successful)
 */

/**
 * Creates an authenticated fetch function with auth headers pre-applied
 *
 * @param {Object} session - The authenticated session with accessToken
 * @returns {Function} - Enhanced fetch function with auth headers
 */
export function createAuthFetch(session) {
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
    } else {
      console.log("API base URL:", baseUrl);
    }

    // Make the request with auth headers
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle common error cases unless resolveOnError is true
    // This allows special handling for binary responses
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
export function useAuthenticatedFetch(serviceFn) {
  const { setConnectivityError, ConnectivityErrorType } = useConnectivityError();

  return async (...args) => {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      if (!session) {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH,
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
          type: ConnectivityErrorType.AUTH,
          message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
        return { success: false, error: { message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED) } };
      }

      if (error?.name === "TypeError" && error?.message === "Failed to fetch") {
        setConnectivityError({
          type: ConnectivityErrorType.NETWORK,
          message: ErrorCode.getMessage(ErrorCode.NETWORK_ERROR),
          code: ErrorCode.NETWORK_ERROR,
        });
        return { success: false, error: { message: ErrorCode.getMessage(ErrorCode.NETWORK_ERROR) } };
      }

      console.error("API error:", error);
      throw error;
    }
  };
}
