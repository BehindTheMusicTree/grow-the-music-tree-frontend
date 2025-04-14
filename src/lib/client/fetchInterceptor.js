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
    const [url] = args;

    try {
      const response = await originalFetch(...args);

      // Handle response errors
      if (!response.ok) {
        // Create a standardized error object
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = { status: response.status };
        error.config = { url };

        // Special handling for authentication errors
        if (response.status === 401) {
          error.name = "AuthenticationError";
        }

        throw error;
      }

      return response;
    } catch (error) {
      // Pass the error to the centralized handler
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
