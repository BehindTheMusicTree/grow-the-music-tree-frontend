"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { setupFetchInterceptor } from "@lib/fetchInterceptor";

const ConnectivityErrorContext = createContext(null);

const ConnectivityErrorType = {
  NONE: "none",
  AUTH: "auth",
  NETWORK: "network",
  INTERNAL: "internal",
  BAD_REQUEST: "badRequest",
};

export function ConnectivityErrorProvider({ children }) {
  const [connectivityError, setConnectivityError] = useState({
    type: ConnectivityErrorType.NONE,
    message: null,
    code: null,
  });

  const handleConnectivityError = useCallback((error) => {
    console.log("ConnectivityErrorProvider handling error:", error);

    if (
      error?.name === "AuthenticationError" ||
      error?.message === "Unauthorized" ||
      error?.status === 401 ||
      error?.cause?.name === "AuthenticationError" ||
      (typeof error === "string" && error.includes("Unauthorized"))
    ) {
      console.log("Auth error detected");
      setConnectivityError({
        type: ConnectivityErrorType.AUTH,
        message: "Please log in to continue",
        code: null,
      });
      return;
    }

    if (error?.status === 400 || error?.name === "BadRequestError") {
      console.log("Bad request error detected");
      setConnectivityError({
        type: ConnectivityErrorType.BAD_REQUEST,
        message: "Invalid request",
        code: error?.code || "BR001",
      });
      return;
    }

    if (error?.name === "InternalServerError" || error?.status === 500 || error?.name === "InternalError") {
      console.log("Internal error detected");
      setConnectivityError({
        type: ConnectivityErrorType.INTERNAL,
        message: "An internal error occurred",
        code: error?.code || "IE001",
      });
      return;
    }

    if (error?.response) {
      setConnectivityError({
        type: ConnectivityErrorType.NETWORK,
        message: `Request failed with status ${error.response.status}`,
        code: null,
      });
      return;
    }

    setConnectivityError({
      type: ConnectivityErrorType.NETWORK,
      message: error?.message || "An unexpected error occurred",
      code: null,
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
    <ConnectivityErrorContext.Provider value={{ connectivityError, handleConnectivityError }}>
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
