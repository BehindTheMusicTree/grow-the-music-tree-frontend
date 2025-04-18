"use client";

import { useConnectivityError } from "@contexts/ConnectivityErrorContext";

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
 * Hook that provides an auth-protected function wrapper
 *
 * @param {Function} clientAction - The client action to wrap with authentication
 * @returns {Function} - Wrapped function that handles auth and error standardization
 */
export function useAuthenticatedFetch(clientAction) {
  // Get connectivity error handlers from context
  const { setConnectivityError, ConnectivityErrorType } = useConnectivityError();

  // Return the wrapped function
  return async (...args) => {
    try {
      console.log("useAuthenticatedFetch");
      // For client-side, we need to import getSession dynamically to avoid
      // server-side import issues
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      console.log("session", session);

      if (!session) {
        console.log("No session, setting auth error");
        setConnectivityError({
          type: ConnectivityErrorType.AUTH,
          message: "Please log in to continue",
          code: "AU001",
        });
        return { success: false, error: { message: "Authentication required" } };
      }

      // Create authenticated fetch helper
      const authFetch = createAuthFetch(session);

      // Call the original action with authFetch and args
      const result = await clientAction(authFetch, ...args);

      // Wrap successful result
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Handle auth errors from external APIs
      if (error?.message === "Unauthorized" || error?.status === 401) {
        console.log("Caught auth error from external API");
        setConnectivityError({
          type: ConnectivityErrorType.AUTH,
          message: "Please log in to continue",
          code: "AU001",
        });
        return { success: false, error: { message: "Authentication required" } };
      }

      // Pass through other errors
      console.error("Client action error:", error);
      throw error;
    }
  };
}
