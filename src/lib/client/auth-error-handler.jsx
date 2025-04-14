"use client";

import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setupFetchInterceptor } from "@lib/fetch/fetchInterceptor";

/**
 * Enhanced client-side component for catching auth errors
 * from server actions, API routes, and fetch calls
 */
export function GlobalAuthErrorHandler() {
  const { showAuthPopup } = useSpotifyAuth();
  const queryClient = useQueryClient();

  // Define a consistent handler for auth errors
  const handleAuthError = useCallback(
    (error) => {
      console.log("Checking error:", error);

      // Enhanced check to catch all variations of auth errors
      if (
        error?.name === "AuthenticationError" ||
        error?.message === "Unauthorized" ||
        error?.status === 401 ||
        error?.cause?.name === "AuthenticationError" ||
        (typeof error === "string" && error.includes("Unauthorized"))
      ) {
        console.log("Auth error detected, showing popup");
        showAuthPopup();
        return true;
      }
      return false;
    },
    [showAuthPopup]
  );

  useEffect(() => {
    // Setup fetch interceptor for direct fetch calls
    const cleanupInterceptor = setupFetchInterceptor((error) => {
      handleAuthError(error);
    });

    // Global handler for unhandled rejections from server actions
    const handleUnhandledRejection = (event) => {
      console.log("Unhandled rejection:", event.reason);
      if (handleAuthError(event.reason)) {
        event.preventDefault();
      }
    };

    // Handler for React Query errors
    queryClient.setDefaultOptions({
      queries: {
        onError: handleAuthError,
        // Retry configuration to avoid unnecessary retries on auth errors
        retry: (failureCount, error) => {
          // Don't retry auth errors
          if (error?.name === "AuthenticationError" || error?.message === "Unauthorized" || error?.status === 401) {
            return false;
          }
          // Default retry logic for other errors
          return failureCount < 3;
        },
      },
      mutations: { onError: handleAuthError },
    });

    // Enhanced error catching - register for different event types
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", (event) => {
      if (handleAuthError(event.error)) {
        event.preventDefault();
      }
    });

    return () => {
      // Clean up all event listeners and interceptors
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleAuthError);
      if (cleanupInterceptor) cleanupInterceptor();
    };
  }, [handleAuthError, queryClient]);

  // This component doesn't render anything
  return null;
}
