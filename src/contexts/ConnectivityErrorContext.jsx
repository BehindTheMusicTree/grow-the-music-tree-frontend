"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { setupFetchInterceptor } from "@lib/fetchInterceptor";
import { ErrorCode } from "@lib/error-codes";

const ConnectivityErrorContext = createContext(null);

const ConnectivityErrorType = {
  NONE: "none",
  AUTH: "auth",
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

  const handleConnectivityError = useCallback((error) => {
    console.log("ConnectivityErrorProvider handling error:", error);

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

      // Check if it's a session expiration case
      if (error?.response?.headers?.get("x-auth-error") === "session-expired") {
        setConnectivityError({
          type: ConnectivityErrorType.SESSION_EXPIRED,
          message: ErrorCode.getMessage(ErrorCode.SESSION_EXPIRED),
          code: ErrorCode.SESSION_EXPIRED,
        });
      } else {
        setConnectivityError({
          type: ConnectivityErrorType.AUTH,
          message: ErrorCode.getMessage(ErrorCode.AUTH_REQUIRED),
          code: ErrorCode.AUTH_REQUIRED,
        });
      }
      return;
    }

    // Handle network errors
    if (error?.name === "TypeError" && error?.message === "Failed to fetch") {
      setConnectivityError({
        type: ConnectivityErrorType.NETWORK,
        message: ErrorCode.getMessage(ErrorCode.NETWORK_ERROR),
        code: ErrorCode.NETWORK_ERROR,
      });
      return;
    }

    // Handle bad requests
    if (error?.status === 400) {
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
  }, []);

  // Add automatic error catching capabilities
  useEffect(() => {
    const cleanupInterceptor = setupFetchInterceptor((error) => {
      handleConnectivityError(error);
    });

    // Handle unhandled rejections (catches server action errors)
    const handleUnhandledRejection = (event) => {
      console.log("Unhandled rejection caught by ConnectivityErrorProvider:", event.reason);
      handleConnectivityError(event.reason);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      cleanupInterceptor();
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [handleConnectivityError]);

  return (
    <ConnectivityErrorContext.Provider value={{ connectivityError, handleConnectivityError, ConnectivityErrorType }}>
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
