import { createContext, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ApiTokenService from "@utils/services/ApiTokenService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return ApiTokenService.hasValidApiToken();
  });
  const lastCheckTimeRef = useRef(Date.now());

  const checkAuth = () => {
    const isValid = ApiTokenService.hasValidApiToken();
    setIsAuthenticated(isValid);
    lastCheckTimeRef.current = Date.now();
    return isValid;
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // If it's been more than 5 minutes since last check, check now
        if (Date.now() - lastCheckTimeRef.current > 300000) {
          checkAuth();
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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>;
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
