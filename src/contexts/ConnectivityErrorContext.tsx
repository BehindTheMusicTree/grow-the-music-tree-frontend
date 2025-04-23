"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ConnectivityError {
  type: ConnectivityErrorType;
  message: string;
  code?: string;
}

interface ConnectivityErrorContextType {
  connectivityError: ConnectivityError | null;
  setConnectivityError: (error: ConnectivityError | null) => void;
  clearConnectivityError: () => void;
}

const ConnectivityErrorContext = createContext<ConnectivityErrorContextType | undefined>(undefined);

interface ConnectivityErrorProviderProps {
  children: ReactNode;
}

export function ConnectivityErrorProvider({ children }: ConnectivityErrorProviderProps) {
  const [connectivityError, setConnectivityError] = useState<ConnectivityError | null>(null);

  const clearConnectivityError = () => {
    setConnectivityError(null);
  };

  return (
    <ConnectivityErrorContext.Provider
      value={{
        connectivityError,
        setConnectivityError,
        clearConnectivityError,
      }}
    >
      {children}
    </ConnectivityErrorContext.Provider>
  );
}

export function useConnectivityError() {
  const context = useContext(ConnectivityErrorContext);
  if (context === undefined) {
    throw new Error("useConnectivityError must be used within a ConnectivityErrorProvider");
  }
  return context;
}
