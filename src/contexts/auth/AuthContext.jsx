import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ApiTokenService from "@utils/services/ApiTokenService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    console.log("[AuthContext isAuthenticated] Checking token status");
    return ApiTokenService.hasValidApiToken();
  });
  const checkIntervalRef = useRef(null);
  const lastCheckTimeRef = useRef(Date.now());

  const checkAuth = () => {
    console.log("[AuthContext checkAuth] Checking token status");
    const isValid = ApiTokenService.hasValidApiToken();
    setIsAuthenticated(isValid);
    lastCheckTimeRef.current = Date.now();
    return isValid;
  };

  const startPeriodicCheck = () => {
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // Get token and expiry
    const token = ApiTokenService.getApiToken();
    const expiryDate = ApiTokenService.getApiTokenExpiry();

    if (!token || !expiryDate) return;

    const now = Date.now();
    const timeUntilExpiry = expiryDate.getTime() - now;

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

    // Listen for storage events
    const handleStorageChange = (e) => {
      if (e.key === "spotify_auth_completed") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getToken = () => {
    const token = ApiTokenService.getApiToken();
    const expiryDate = ApiTokenService.getApiTokenExpiry();
    return { token, expiryDate };
  };

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
