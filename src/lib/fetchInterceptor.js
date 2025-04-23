"use client";

import { FetchErrorType } from "./fetchErrorTypes";

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
        const errorType = FetchErrorType.getTypeFromStatus(response.status);
        const specificError = FetchErrorType.getSpecificErrorFromStatus(response.status);

        const error = new Error(FetchErrorType.getMessageFromError({ response }));
        error.response = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        };
        error.request = requestDetails;
        error.type = errorType;
        error.specificError = specificError;

        // Special handling for authentication errors
        if (response.status === 401) {
          error.name = "AuthenticationError";
          // Check for session expiration header
          if (response.headers.get("x-auth-error") === "session-expired") {
            error.specificError = FetchErrorType.AUTH.SESSION_EXPIRED;
          }
        }

        throw error;
      }

      return response;
    } catch (error) {
      console.log("Fetch interceptor caught error:", error);

      // Specifically handle network errors like ERR_CONNECTION_REFUSED
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.log("Network error detected: Connection likely refused");
        error.isNetworkError = true;
        error.type = FetchErrorType.NETWORK;
        error.specificError = FetchErrorType.NETWORK.CONNECTION_REFUSED;
        error.friendlyMessage = FetchErrorType.getMessageFromError(error);
      }

      // If it's not our error object, add the request details
      if (!error.request) {
        error.request = requestDetails;
      }

      // Pass the error to the centralized handler
      console.log("Passing error to central handler:", error);
      handleError(error);
      throw error; // Re-throw to maintain fetch error behavior
    }
  };

  // Return a cleanup function
  return () => {
    if (typeof window !== "undefined") {
      window.fetch = originalFetch;
    }
  };
};
