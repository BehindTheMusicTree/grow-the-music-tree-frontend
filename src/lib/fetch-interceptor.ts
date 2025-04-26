"use client";

import { AppError } from "@app-types/app-errors/app-error";
import {
  createAppErrorFromHttpUrlAndStatus,
  createAppErrorFromErrorCode,
} from "@app-types/app-errors/app-error-factory";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

// Store the original fetch only in browser environments
const originalFetch: typeof fetch | null = typeof window !== "undefined" ? window.fetch : null;

/**
 * Sets up a global fetch interceptor that handles errors consistently
 */
export const setupFetchInterceptor = (handleError: (error: Error) => void): (() => void) => {
  // Skip setup in SSR environments
  if (typeof window === "undefined") return () => {};

  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [url] = args;

    try {
      console.log(`Fetch request to: ${url}`);
      if (!originalFetch) {
        throw new Error("Fetch is not available in this environment");
      }
      const response = await originalFetch(...args);

      // Handle response errors
      if (!response.ok) {
        console.log("Response error:", response);
        throw createAppErrorFromHttpUrlAndStatus(response.url, response.status);
      }

      return response;
    } catch (caughtError: unknown) {
      console.log("Fetch interceptor caught error:", caughtError);

      let error: Error;
      if (!navigator.onLine) {
        error = createAppErrorFromErrorCode(ErrorCode.NETWORK_OFFLINE);
      }

      if (caughtError instanceof AppError) {
        error = caughtError;
      } else {
        if (caughtError instanceof Error) {
          // Specifically handle network errors like ERR_CONNECTION_REFUSED
          if (caughtError instanceof TypeError && caughtError.message === "Failed to fetch") {
            console.log("Network error detected: Connection likely refused");
            error = createAppErrorFromErrorCode(ErrorCode.NETWORK_CONNECTION_REFUSED);
          } else if (caughtError.name === "AbortError") {
            error = createAppErrorFromErrorCode(ErrorCode.NETWORK_ABORT_ERROR);
          } else if (caughtError.message?.includes("Failed to fetch")) {
            error = createAppErrorFromErrorCode(ErrorCode.NETWORK_FAILED_TO_FETCH);
          } else {
            error = createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
          }
        } else {
          error = createAppErrorFromErrorCode(ErrorCode.NETWORK_UNKNOWN);
        }
      }

      handleError(error);
    }
  };

  // Return a cleanup function
  return () => {
    if (typeof window !== "undefined" && originalFetch) {
      window.fetch = originalFetch;
    }
  };
};
