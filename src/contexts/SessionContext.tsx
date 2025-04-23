"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface Session {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

interface SessionContextType {
  session: Session;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

const defaultSession: Session = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session>(defaultSession);

  const clearSession = () => {
    setSession(defaultSession);
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
