"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Session } from "@app-types/Session";
import { queryClient } from "@lib/query-client";

interface SessionContextType {
  session: Session;
  setSession: (session: Session) => void;
  clearSession: () => void;
  sessionRestored: boolean;
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
  const [session, setSessionState] = useState<Session>(defaultSession);
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        setSessionState(JSON.parse(storedSession));
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setSessionRestored(true);
  }, []);

  const setSession = (newSession: Session) => {
    setSessionState(newSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const clearSession = () => {
    setSessionState(defaultSession);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    queryClient.clear();
  };

  return (
    <SessionContext.Provider value={{ session, setSession, clearSession, sessionRestored }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
