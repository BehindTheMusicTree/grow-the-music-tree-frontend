"use client";

import { ErrorHandler, NetworkError, AuthError, ServerError, ClientError } from "./connectivity-errors/error-types";

// Store the original fetch only in browser environments
const originalFetch = typeof window !== "undefined" ? window.fetch : null;

/**
 * Sets up a global fetch interceptor that handles errors consistently
 */
export const setupFetchInterceptor = (handleError) => {
  // Skip setup in SSR environments
  if (typeof window === "undefined") return;

  window.fetch = async (...args) => {
    const [url, requestInit = {}] = args;

    // Clone the request init to preserve the original request details
    const requestDetails = {
      url,
      method: requestInit.method || "GET",
      headers: requestInit.headers ? Object.fromEntries(new Headers(requestInit.headers).entries()) : {},
      body: requestInit.body,
      ...requestInit,
    };

    try {
      console.log(`Fetch request to: ${url}`);
      const response = await originalFetch(...args);

      // Handle response errors
      if (!response.ok) {
        console.log("Response error:", response);
        let error = ErrorHandler.getErrorFromStatus(response.status);
        error.response = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        };
        error.request = requestDetails;

        // Special handling for authentication errors
        if (response.status === 401) {
          // Check for session expiration header
          if (response.headers.get("x-auth-error") === "session-expired") {
            error = AuthError.SESSION_EXPIRED;
          }
        }

        throw error;
      }

      return response;
    } catch (caughtError) {
      console.log("Fetch interceptor caught error:", caughtError);
      let error = caughtError;

      // Specifically handle network errors like ERR_CONNECTION_REFUSED
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.log("Network error detected: Connection likely refused");
        error = NetworkError.CONNECTION_REFUSED;
      }

      // If it's not our error object, add the request details
      if (!error.request) {
        error.request = requestDetails;
      }

      // Pass the error to the centralized handler
      console.log("Passing error to central handler:", error);
      handleError(error);

      if (error instanceof Error) {
        throw error;
      }

      if (error.name === "AbortError") {
        throw NetworkError.TIMEOUT;
      }

      if (!navigator.onLine) {
        throw NetworkError.OFFLINE;
      }

      if (error.message?.includes("Failed to fetch")) {
        throw NetworkError.CONNECTION_REFUSED;
      }

      throw ServerError.INTERNAL;
    }
  };

  // Return a cleanup function
  return () => {
    if (typeof window !== "undefined") {
      window.fetch = originalFetch;
    }
  };
};
