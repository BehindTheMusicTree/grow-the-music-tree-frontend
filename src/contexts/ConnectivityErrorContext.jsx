"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { setupFetchInterceptor } from "@lib/client/fetchInterceptor";
import { useQueryClient } from "@tanstack/react-query";

const ConnectivityErrorContext = createContext(null);

const ErrorType = {
  NONE: "none",
  AUTH: "auth",
  NETWORK: "network",
};

export function ConnectivityErrorProvider({ children }) {
  const queryClient = useQueryClient();
  const [connectivityError, setConnectivityError] = useState({ type: ErrorType.NONE, message: null });

  const handleConnectivityError = useCallback((error) => {
    console.log("ConnectivityErrorProvider handling error:", error);

    // Handle authentication errors
    if (
      error?.name === "AuthenticationError" ||
      error?.message === "Unauthorized" ||
      error?.status === 401 ||
      error?.cause?.name === "AuthenticationError" ||
      (typeof error === "string" && error.includes("Unauthorized"))
    ) {
      console.log("Auth error detected");
      setConnectivityError({ type: ErrorType.AUTH, message: "Please log in to continue" });
      return;
    }

    // Handle fetch errors
    if (error?.response) {
      setConnectivityError({
        type: ErrorType.NETWORK,
        message: `Request failed with status ${error.response.status}`,
      });
      return;
    }

    // Handle generic errors
    setConnectivityError({
      type: ErrorType.NETWORK,
      message: error?.message || "An unexpected error occurred",
    });
  }, []);

  // Add automatic error catching capabilities
  useEffect(() => {
    // Setup fetch interceptor
    const cleanupInterceptor = setupFetchInterceptor((error) => {
      handleConnectivityError(error);
    });

    // Handle unhandled rejections (catches server action errors)
    const handleUnhandledRejection = (event) => {
      console.log("Unhandled rejection caught by ConnectivityErrorProvider:", event.reason);
      handleConnectivityError(event.reason);
    };

    // Handle window errors
    const handleWindowError = (event) => {
      if (event.error) {
        handleConnectivityError(event.error);
      }
    };

    // Set up React Query defaults
    queryClient.setDefaultOptions({
      queries: {
        onError: handleConnectivityError,
        retry: (failureCount, error) => {
          if (error?.name === "AuthenticationError" || error?.message === "Unauthorized" || error?.status === 401) {
            return false; // Don't retry auth errors
          }
          return failureCount < 3; // Default retry logic
        },
      },
      mutations: {
        onError: handleConnectivityError,
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
  }, [handleConnectivityError, queryClient]);

  const clearConnectivityError = useCallback(() => {
    setConnectivityError({ type: ErrorType.NONE, message: null });
  }, []);

  return (
    <ConnectivityErrorContext.Provider
      value={{
        connectivityError,
        clearConnectivityError,
        ErrorType,
      }}
    >
      {children}
    </ConnectivityErrorContext.Provider>
  );
}

export function useConnectivityError() {
  const context = useContext(ConnectivityErrorContext);
  if (!context) {
    throw new Error("useConnectivityError must be used within a ConnectivityErrorProvider");
  }
  return context;
}
