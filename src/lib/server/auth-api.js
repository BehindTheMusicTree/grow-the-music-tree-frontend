// NO "use client" - this is server-only code
import { getServerSession } from "next-auth";

/**
 * Creates an authenticated fetch function with auth headers pre-applied
 *
 * @param {Object} session - The authenticated session with accessToken
 * @returns {Function} - Enhanced fetch function with auth headers
 */
export function createAuthFetch(session) {
  return async (url, options = {}) => {
    // Extract special options
    const { resolveOnError, ...fetchOptions } = options;

    // Build headers with auth
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      ...fetchOptions.headers,
    };

    // Make the request with auth headers
    const response = await fetch(url, {
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
export function withAuthProtection(serverAction, authOptionsArg) {
  return async (...args) => {
    try {
      // Check authentication
      const session = await getServerSession(authOptionsArg);
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
