"use client";

import { createContext, useContext, useCallback, useEffect } from "react";
import { usePopup } from "./PopupContext";
import { setupFetchInterceptor } from "@lib/fetch/fetchInterceptor";
import { useQueryClient } from "@tanstack/react-query";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const { showPopup } = usePopup();
  const queryClient = useQueryClient();

  const handleError = useCallback(
    (error) => {
      console.log("ErrorProvider handling error:", error);

      // Handle authentication errors
      if (
        error?.name === "AuthenticationError" ||
        error?.message === "Unauthorized" ||
        error?.status === 401 ||
        error?.cause?.name === "AuthenticationError" ||
        (typeof error === "string" && error.includes("Unauthorized"))
      ) {
        console.log("Auth error detected, showing popup");
        showPopup("spotifyAuth", {
          message: "Connect your Spotify account to access all features",
          onAuthenticate: () => {
            // This will be handled by the popup component
          },
        });
        return;
      }

      // Handle fetch errors
      if (error?.response) {
        showPopup("error", {
          message: `Request failed with status ${error.response.status}`,
        });
        return;
      }

      // Handle generic errors
      showPopup("error", {
        message: error?.message || "An unexpected error occurred",
      });
    },
    [showPopup]
  );

  // Add automatic error catching capabilities
  useEffect(() => {
    // Setup fetch interceptor
    const cleanupInterceptor = setupFetchInterceptor((error) => {
      handleError(error);
    });

    // Handle unhandled rejections (catches server action errors)
    const handleUnhandledRejection = (event) => {
      console.log("Unhandled rejection caught by ErrorProvider:", event.reason);
      handleError(event.reason);
    };

    // Handle window errors
    const handleWindowError = (event) => {
      if (event.error) {
        handleError(event.error);
      }
    };

    // Set up React Query defaults
    queryClient.setDefaultOptions({
      queries: {
        onError: handleError,
        retry: (failureCount, error) => {
          if (error?.name === "AuthenticationError" || error?.message === "Unauthorized" || error?.status === 401) {
            return false; // Don't retry auth errors
          }
          return failureCount < 3; // Default retry logic
        },
      },
      mutations: {
        onError: handleError,
      },
    });

    // Set up global listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    return () => {
      // Clean up all listeners and interceptors
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
      if (cleanupInterceptor) cleanupInterceptor();
    };
  }, [handleError, queryClient]);

  return <ErrorContext.Provider value={{ handleError }}>{children}</ErrorContext.Provider>;
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
