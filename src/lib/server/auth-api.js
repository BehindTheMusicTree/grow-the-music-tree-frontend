// NO "use client" - this is server-only code
import { getServerSession } from "next-auth";
import { serverConfig } from "@lib/server/server-config";
import { publicConfig } from "@lib/public-config";
import { authOptions } from "@lib/server/auth-spotify";

/**
 * Standard response object for authentication errors
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the operation was successful
 * @property {Object} data - The operation result data (if successful)
 * @property {Object} error - Error information (if not successful)
 */

/**
 * Creates a standard auth error response object
 * This avoids throwing errors which cause 500 status codes
 */
export function createAuthErrorResponse() {
  return {
    success: false,
    error: {
      type: "auth",
      code: "unauthorized",
      message: "Authentication required",
    },
  };
}

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

    // Make the request with auth headers
    const response = await fetch(`${publicConfig.apiBaseUrl}${endpoint}`, {
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
 * Server-side wrapper that standardizes auth and provides authFetch
 */
export function withAuthProtection(serverAction) {
  return async (...args) => {
    try {
      // Check authentication using combined auth options
      const session = await getServerSession({
        ...authOptions,
        ...serverConfig.authOptions,
      });
      if (!session) {
        const error = new Error("Unauthorized");
        error.name = "AuthenticationError";
        error.status = 401;
        throw error;
      }

      // Create authenticated fetch helper
      const authFetch = createAuthFetch(session);

      // Call the original action with session, authFetch and args
      return await serverAction(session, authFetch, ...args);
    } catch (error) {
      // Standardize auth errors
      if (error?.message === "Unauthorized" || error?.status === 401) {
        const authError = new Error("Unauthorized");
        authError.name = "AuthenticationError";
        authError.status = 401;
        throw authError;
      }
      throw error;
    }
  };
}
