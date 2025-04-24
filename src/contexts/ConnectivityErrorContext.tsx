"use client";

import AppError from "@/types/app-errors/app-error";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppErrorContextType {
  appError: AppError | null;
  setAppError: (error: AppError | null) => void;
  clearAppError: () => void;
}

const AppErrorContext = createContext<AppErrorContextType | undefined>(undefined);

interface AppErrorProviderProps {
  children: ReactNode;
}

export function AppErrorProvider({ children }: AppErrorProviderProps) {
  const [error, setAppError] = useState<AppError | null>(null);

  const clearAppError = () => {
    setAppError(null);
  };

  return (
    <AppErrorContext.Provider
      value={{
        appError: error,
        setAppError: setAppError,
        clearAppError: clearAppError,
      }}
    >
      {children}
    </AppErrorContext.Provider>
  );
}

export function useAppError() {
  const context = useContext(AppErrorContext);
  if (context === undefined) {
    throw new Error("useAppError must be used within a AppErrorProvider");
  }
  return context;
}
