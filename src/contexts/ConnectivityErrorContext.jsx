"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { NetworkError, AuthError, ServerError, ClientError } from "@lib/errors/error-types";

const ConnectivityErrorContext = createContext();

export const useConnectivityError = () => {
  const context = useContext(ConnectivityErrorContext);
  if (!context) {
    throw new Error("useConnectivityError must be used within a ConnectivityErrorProvider");
  }
  return context;
};

export const ConnectivityErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const handleError = useCallback((error) => {
    console.log("ConnectivityErrorProvider handling error:", error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      clearError();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setError(NetworkError.OFFLINE);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [clearError]);

  const getErrorType = (error) => {
    if (error instanceof NetworkError) {
      return "network";
    } else if (error instanceof AuthError) {
      return "auth";
    } else if (error instanceof ServerError) {
      return "server";
    } else if (error instanceof ClientError) {
      return "client";
    }
    return "unknown";
  };

  const getErrorMessage = (error) => {
    return error?.message || "An unknown error occurred";
  };

  const value = {
    error,
    isOffline,
    handleError,
    clearError,
    getErrorType,
    getErrorMessage,
  };

  return <ConnectivityErrorContext.Provider value={value}>{children}</ConnectivityErrorContext.Provider>;
};
