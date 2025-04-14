"use client";

import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Custom error class for auth errors
export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Global error handler for authentication errors
 * Place this at the top level of your application
 */
export function GlobalAuthErrorHandler() {
  const { showAuthPopup } = useSpotifyAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const error = event.reason;
      
      // Check if it's an auth error from server action or API
      if (
        error?.name === "AuthenticationError" || 
        error?.message === "Unauthorized" ||
        error?.status === 401
      ) {
        // Show auth popup
        showAuthPopup();
        
        // Prevent default handling
        event.preventDefault();
      }
    };

    // Setup global error handler for React Query
    queryClient.setDefaultOptions({
      queries: {
        onError: (error) => {
          if (
            error?.name === "AuthenticationError" || 
            error?.message === "Unauthorized" ||
            error?.status === 401
          ) {
            showAuthPopup();
          }
        },
      },
      mutations: {
        onError: (error) => {
          if (
            error?.name === "AuthenticationError" || 
            error?.message === "Unauthorized" ||
            error?.status === 401
          ) {
            showAuthPopup();
          }
        },
      },
    });

    // Register global handler
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [showAuthPopup, queryClient]);

  // This component doesn't render anything
  return null;
}

/**
 * Wrapper for server actions to standardize error handling
 * @param {Function} serverAction - The server action to wrap
 * @returns {Function} - Wrapped function with standardized error handling
 */
export function withAuthHandling(serverAction) {
  return async (...args) => {
    try {
      return await serverAction(...args);
    } catch (error) {
      // Standardize auth errors
      if (error.message === "Unauthorized") {
        throw new AuthenticationError();
      }
      throw error;
    }
  };
}