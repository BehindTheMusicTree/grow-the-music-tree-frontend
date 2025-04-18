"use client";

import { createContext, useContext, useState, useEffect } from "react";

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
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Check localStorage for existing session
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        // Check if session is still valid
        if (parsedSession.expiresAt > Date.now()) {
          setSession(parsedSession);
        } else {
          // Session expired, clear it
          localStorage.removeItem("session");
        }
      } catch (error) {
        console.error("Failed to parse stored session:", error);
        localStorage.removeItem("session");
      }
    }
    setStatus("idle");
  }, []);

  const updateSession = (newSession) => {
    if (newSession) {
      localStorage.setItem("session", JSON.stringify(newSession));
    } else {
      localStorage.removeItem("session");
    }
    setSession(newSession);
  };

  const value = {
    data: session,
    status,
    updateSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
