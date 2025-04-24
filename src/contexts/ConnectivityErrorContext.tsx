"use client";

import { ConnectivityError, AppErrorType } from "@/types/app-errors/app-error";
import { createContext, useContext, useState, ReactNode } from "react";

interface ConnectivityErrorContextType {
  connectivityError: AppErrorType | null;
  setConnectivityError: (error: AppErrorType | null) => void;
  clearConnectivityError: () => void;
}

const ConnectivityErrorContext = createContext<ConnectivityErrorContextType | undefined>(undefined);

interface ConnectivityErrorProviderProps {
  children: ReactNode;
}

export function ConnectivityErrorProvider({ children }: ConnectivityErrorProviderProps) {
  const [connectivityError, setConnectivityError] = useState<AppErrorType | null>(null);

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
