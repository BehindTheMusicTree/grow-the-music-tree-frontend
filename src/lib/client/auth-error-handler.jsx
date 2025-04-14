"use client";

import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Client-side component for catching auth errors
 */
export function GlobalAuthErrorHandler() {
  const { showAuthPopup } = useSpotifyAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthError = (error) => {
      if (
        error?.name === "AuthenticationError" || 
        error?.message === "Unauthorized" ||
        error?.status === 401
      ) {
        showAuthPopup();
        return true;
      }
      return false;
    };

    // Global handler for unhandled rejections
    const handleUnhandledRejection = (event) => {
      if (handleAuthError(event.reason)) {
        event.preventDefault();
      }
    };

    // Handler for React Query errors
    queryClient.setDefaultOptions({
      queries: { onError: handleAuthError },
      mutations: { onError: handleAuthError },
    });

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [showAuthPopup, queryClient]);

  return null;
}