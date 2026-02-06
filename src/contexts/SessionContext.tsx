"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Session } from "@app-types/Session";

interface SessionContextType {
  session: Session;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

const defaultSession: Session = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

const SESSION_STORAGE_KEY = "session";

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSessionState] = useState<Session>(() => {
    if (typeof window !== "undefined") {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      return storedSession ? JSON.parse(storedSession) : defaultSession;
    }
    return defaultSession;
  });

  const setSession = (newSession: Session) => {
    setSessionState(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const clearSession = () => {
    setSessionState(defaultSession);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return <SessionContext.Provider value={{ session, setSession, clearSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
