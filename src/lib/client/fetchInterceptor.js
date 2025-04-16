"use client";

import { isBrowser } from "@utils/browser";

// Store the original fetch only in browser environments
const originalFetch = isBrowser() ? window.fetch : null;

/**
 * Sets up a global fetch interceptor that handles errors consistently
 */
export const setupFetchInterceptor = (handleError) => {
  // Skip setup in SSR environments
  if (!isBrowser()) return;

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
      const response = await originalFetch(...args);

      // Handle response errors
      if (!response.ok) {
        // Create a standardized error object with original request details
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        };
        error.request = requestDetails;

        // Special handling for authentication errors
        if (response.status === 401) {
          error.name = "AuthenticationError";
        }

        throw error;
      }

      return response;
    } catch (error) {
      // If it's not our error object, add the request details
      if (!error.request) {
        error.request = requestDetails;
      }
      // Pass the error to the centralized handler
      handleError(error);
      throw error; // Re-throw to maintain fetch error behavior
    }
  };

  // Return a cleanup function
  return () => {
    if (isBrowser()) {
      window.fetch = originalFetch;
    }
  };
};
