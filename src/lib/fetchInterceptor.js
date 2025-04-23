"use client";

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
      console.log(`setupFetchInterceptor Fetch request to: ${url}`);
      const response = await originalFetch(...args);

      // Handle response errors
      if (!response.ok) {
        console.log("setupFetchInterceptor Response error:", response);
        // Create a standardized error object with original request details
        const error = new Error(`Request to "${response.url}" failed with status ${response.status}`);
        error.response = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        };
        error.request = requestDetails;

        // Special handling for authentication errors
        if (response.status === 401) {
          error.name = "AuthenticationError";
          // Check for session expiration header
          if (response.headers.get("x-auth-error") === "session-expired") {
            error.name = "SessionExpiredError";
          }
        }

        throw error;
      }

      return response;
    } catch (error) {
      console.log("setupFetchInterceptor Fetch interceptor caught error:", error);

      // Specifically handle network errors like ERR_CONNECTION_REFUSED
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.log("setupFetchInterceptor Network error detected: Connection likely refused");
        // Enhance the error with additional metadata
        error.isNetworkError = true;
        error.errorType = "NETWORK_CONNECTION_ERROR";
        error.friendlyMessage =
          "Unable to connect to the server. Please check your network or the server might be down.";
      }

      // If it's not our error object, add the request details
      if (!error.request) {
        error.request = requestDetails;
      }

      // Pass the error to the centralized handler
      console.log("setupFetchInterceptor Passing error to central handler:", error);
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
