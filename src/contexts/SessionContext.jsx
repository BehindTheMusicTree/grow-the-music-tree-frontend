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
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Check localStorage for existing session
    const storedSession = localStorage.getItem("session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        // Check if session has required fields
        if (parsedSession.accessToken) {
          setSession(parsedSession);
        } else {
          // Invalid session data, clear it
          localStorage.removeItem("session");
        }
      } catch (error) {
        console.error("Failed to parse stored session:", error);
        localStorage.removeItem("session");
      }
    }
    setStatus("idle");
  }, []);

  const updateSession = useCallback((newSession) => {
    console.log("updateSession", newSession);
    if (newSession && newSession.accessToken) {
      // Ensure all required fields are present
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
    status,
    updateSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
