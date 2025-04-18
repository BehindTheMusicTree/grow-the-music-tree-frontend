"use client";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth/auth-spotify";

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
 * Server-side wrapper that handles auth and provides standard response format
 * Returns response objects instead of throwing errors for auth issues
 */
export function withAuthProtection(serverAction) {
  return async (...args) => {
    console.log("withAuthProtection");
    console.log(args);
    try {
      // Check authentication using authOptions
      const session = await getServerSession(authOptions);

      if (!session) {
        // Return auth error response instead of throwing
        console.log("Not authenticated, returning auth error response");
        return createAuthErrorResponse();
      }

      // Create authenticated fetch helper
      const authFetch = createAuthFetch(session);

      // Call the original action with authFetch and args
      const result = await serverAction(authFetch, ...args);

      // Wrap successful result
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Handle auth errors from external APIs
      if (error?.message === "Unauthorized" || error?.status === 401) {
        console.log("Caught auth error from external API");
        return createAuthErrorResponse();
      }

      // Pass through other errors
      console.error("Server action error:", error);
      throw error;
    }
  };
}

/**
 * Client-side wrapper that handles auth and provides standard response format
 * Similar to withAuthProtection but uses client-side session handling
 *
 * @param {Function} clientAction - The client action to wrap with authentication
 * @returns {Function} - Wrapped function that handles auth and error standardization
 */
export function withAuthProtection(clientAction) {
  return async (...args) => {
    console.log("withAuthProtection");

    try {
      // For client-side, we need to import getSession dynamically to avoid
      // server-side import issues
      const { getSession } = await import("next-auth/react");
      const session = await getSession();

      if (!session) {
        // Return auth error response instead of throwing
        console.log("Not authenticated, returning auth error response");
        return createAuthErrorResponse();
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
        return createAuthErrorResponse();
      }

      // Pass through other errors
      console.error("Client action error:", error);
      throw error;
    }
  };
}
