"use client";

import { isBrowser } from "@utils/browser";
import { validateClientEnv } from "@lib/env-validator";

// Store the original fetch only in browser environments
const originalFetch = isBrowser() ? window.fetch : null;

/**
 * Sets up a global fetch interceptor that handles errors consistently
 */
export const setupFetchInterceptor = (handleError) => {
  // Skip setup in SSR environments
  if (!isBrowser()) return;

  // Validate client environment variables on initialization
  try {
    validateClientEnv();
  } catch (error) {
    error.name = "EnvironmentError";
    handleError(error);
    // We don't throw here to allow the app to continue, but the error will be logged
    console.error("Client environment validation failed:", error.message);
  }

  window.fetch = async (...args) => {
    const [url, requestInit = {}] = args;

    // Validate URL
    if (!url) {
      const error = new Error("No URL provided to fetch");
      error.name = "FetchConfigError";
      handleError(error);
      throw error;
    }

    // Check for malformed URLs that might include undefined values
    if (url.includes("undefined/") || url === "undefined") {
      const error = new Error(
        `Malformed URL detected: "${url}". This might be caused by undefined environment variables.`
      );
      error.name = "EnvironmentError";
      handleError(error);
      throw error;
    }

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
