"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { setupFetchInterceptor } from "@lib/fetchInterceptor";
import { ErrorCode } from "./error-codes";
import { useSession } from "./SessionContext";

const ConnectivityErrorContext = createContext(null);

const ConnectivityErrorType = {
  NONE: "none",
  AUTH_REQUIRED: "authRequired",
  NETWORK: "network",
  INTERNAL: "internal",
  BAD_REQUEST: "badRequest",
  SESSION_EXPIRED: "sessionExpired",
};

export function ConnectivityErrorProvider({ children }) {
  const [connectivityError, setConnectivityError] = useState({
    type: ConnectivityErrorType.NONE,
    message: null,
    code: null,
  });
  const { session, isLoading: isSessionLoading, updateSession } = useSession();

  useEffect(() => {
    console.log("ConnectivityErrorProvider: session changed", session);
    if (!isSessionLoading) {
      if (session) {
        setConnectivityError({
          type: ConnectivityErrorType.NONE,
          message: null,
          code: null,
        });
      } else {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH_REQUIRED,
          message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
      }
    }
  }, [session, isSessionLoading]);

  const handleConnectivityError = useCallback(
    (error) => {
      console.log("ConnectivityErrorProvider handling error:", error);

      // Handle network errors first
      if (
        (error?.name === "TypeError" && error?.message === "Failed to fetch") ||
        error?.isNetworkError === true ||
        error?.errorType === ConnectivityErrorType.NETWORK
      ) {
        console.log("Network error detected by ConnectivityErrorProvider");
        setConnectivityError({
          type: ConnectivityErrorType.NETWORK,
          message: error?.friendlyMessage || ErrorCode.getMessage(ErrorCode.NETWORK_ERROR),
          code: ErrorCode.NETWORK_ERROR,
        });
        return;
      }

      // Handle session expiration and auth errors
      if (
        error?.name === "AuthenticationError" ||
        error?.message === "Unauthorized" ||
        error?.status === 401 ||
        error?.cause?.name === "AuthenticationError" ||
        (typeof error === "string" && error.includes("Unauthorized")) ||
        error?.response?.status === 401
      ) {
        console.log("Auth error detected");

        updateSession(null);

        // Check if it's a session expiration case
        if (error?.response?.headers?.get("x-auth-error") === "session-expired") {
          setConnectivityError({
            type: ConnectivityErrorType.SESSION_EXPIRED,
            message: ErrorCode.getMessage(ErrorCode.SESSION_EXPIRED),
            code: ErrorCode.SESSION_EXPIRED,
          });
        } else {
          setConnectivityError({
            type: ConnectivityErrorType.AUTH_REQUIRED,
            message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
            code: ErrorCode.AUTH_REQUIRED,
          });
        }
        return;
      }

      // Handle bad requests
      if (error?.status === 400) {
        console.error("Bad request error response:", error?.response);
        setConnectivityError({
          type: ConnectivityErrorType.BAD_REQUEST,
          message: ErrorCode.getMessage(ErrorCode.BAD_REQUEST),
          code: ErrorCode.BAD_REQUEST,
        });
        return;
      }

      // Handle internal server errors
      if (error?.status >= 500) {
        setConnectivityError({
          type: ConnectivityErrorType.INTERNAL,
          message: ErrorCode.getMessage(ErrorCode.SERVER_ERROR),
          code: ErrorCode.SERVER_ERROR,
        });
        return;
      }

      // Default error
      setConnectivityError({
        type: ConnectivityErrorType.INTERNAL,
        message: ErrorCode.getMessage(ErrorCode.SERVER_ERROR),
        code: ErrorCode.SERVER_ERROR,
      });
    },
    [updateSession]
  );

  // Add automatic error catching capabilities
  useEffect(() => {
    const cleanupInterceptor = setupFetchInterceptor((error) => {
      handleConnectivityError(error);
    });

    // Handle unhandled rejections (catches server action errors)
    const handleUnhandledRejection = (event) => {
      const error = event.reason;

      // Process all errors, including fetch errors, to ensure nothing is missed
      console.log("ConnectivityErrorProvider: Processing unhandled rejection through fallback handler");

      // Note: We don't need to enhance network errors as the handleConnectivityError function
      // already checks for "TypeError" with "Failed to fetch" message

      handleConnectivityError(error);
    };

    // Handle unhandled rejections (catches server action errors)
    // Fired when a JavaScript Promise is rejected but there's no .catch() handler to handle the rejection.
    // Particularly useful for catching and handling:
    // - Network errors
    // - API failures
    // - Any other asynchronous operations that fail without proper error handling
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      cleanupInterceptor();
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [handleConnectivityError]);

  return (
    <ConnectivityErrorContext.Provider
      value={{
        connectivityError,
        handleConnectivityError,
        setConnectivityError,
        ConnectivityErrorType,
        ErrorCode,
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
