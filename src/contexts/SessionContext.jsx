"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession.accessToken) {
          setSession(parsedSession);
        } else {
          localStorage.removeItem("session");
        }
      } catch (error) {
        console.error("Failed to parse stored session:", error);
        localStorage.removeItem("session");
      }
    }
    setIsLoading(false);
  }, []);

  const updateSession = useCallback((newSession) => {
    if (newSession && newSession.accessToken) {
      const completeSession = {
        accessToken: newSession.accessToken,
        refreshToken: newSession.refreshToken || null,
        expiresAt: newSession.expiresAt || null,
        spotifyUser: newSession.spotifyUser || null,
      };
      localStorage.setItem("session", JSON.stringify(completeSession));
      setSession(completeSession);
    } else {
      localStorage.removeItem("session");
      setSession(null);
    }
  }, []);

  const value = {
    session,
    isLoading,
    updateSession,
  };

  if (isLoading) {
    return null;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
