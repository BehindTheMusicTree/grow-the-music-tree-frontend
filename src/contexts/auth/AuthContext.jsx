import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import SpotifyTokenService from "@utils/services/SpotifyTokenService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyTokenService.hasValidSpotifyToken();
  });
  const checkIntervalRef = useRef(null);
  const lastCheckTimeRef = useRef(Date.now());

  const checkAuth = () => {
    const isValid = SpotifyTokenService.hasValidSpotifyToken();
    setIsAuthenticated(isValid);
    lastCheckTimeRef.current = Date.now();
    return isValid;
  };

  const startPeriodicCheck = () => {
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // Get token expiration time
    const tokenData = SpotifyTokenService.getSpotifyTokenData();
    if (!tokenData) return;

    const now = Date.now();
    const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
    const timeUntilExpiry = tokenData.created_at + expiresIn - now;

    // If token is expired or will expire soon, check more frequently
    if (timeUntilExpiry <= 0) {
      checkIntervalRef.current = setInterval(checkAuth, 30000); // Every 30 seconds
    } else if (timeUntilExpiry <= 300000) {
      // Less than 5 minutes until expiry
      checkIntervalRef.current = setInterval(checkAuth, 60000); // Every minute
    } else {
      checkIntervalRef.current = setInterval(checkAuth, 300000); // Every 5 minutes
    }
  };

  useEffect(() => {
    // Initial check
    checkAuth();
    startPeriodicCheck();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // If it's been more than 5 minutes since last check, check now
        if (Date.now() - lastCheckTimeRef.current > 300000) {
          checkAuth();
        }
        startPeriodicCheck();
      } else {
        // Clear interval when tab is not visible
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
