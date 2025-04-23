"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ConnectivityError, ConnectivityErrorContextType, ConnectivityErrorType } from "@types/context";

const ConnectivityErrorContext = createContext<ConnectivityErrorContextType | null>(null);

export function ConnectivityErrorProvider({ children }: { children: ReactNode }) {
  const [connectivityError, setConnectivityError] = useState<ConnectivityError | null>(null);

  return (
    <ConnectivityErrorContext.Provider value={{ connectivityError, setConnectivityError, ConnectivityErrorType }}>
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
