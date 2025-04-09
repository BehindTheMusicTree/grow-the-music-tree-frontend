import { useCallback } from "react";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";
import useSpotifyAuthActions from "./useSpotifyAuthActions";

/**
 * Custom hook for handling authentication errors consistently across the application
 * Provides a unified way to handle auth errors and trigger authentication flows
 * 
 * @param {Function} setErrorCallback - Callback to set error message in UI (optional)
 * @returns {Object} Auth error handling utilities
 */
export default function useAuthErrorHandler(setErrorCallback = null) {
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();
  
  /**
   * Handles authentication errors and triggers appropriate UI responses
   * @param {Error} error - The error to handle
   * @param {string} errorPrefix - Prefix for error message (e.g., "Failed to load genres")
   * @returns {boolean} True if the error was an auth error and was handled
   */
  const handleAuthError = useCallback((error, errorPrefix = "Operation failed") => {
    // Handle unauthorized requests - trigger auth flow
    if (error instanceof UnauthorizedRequestError) {
      // Set UI error if callback provided
      if (setErrorCallback) {
        setErrorCallback("Authentication required");
      }
      
      // Trigger auth flow
      checkTokenAndShowAuthIfNeeded(true);
      return true;
    }
    
    // If not an auth error, set a generic error message if callback is provided
    if (setErrorCallback) {
      setErrorCallback(`${errorPrefix}: ${error.message || "Unknown error"}`);
    }
    
    // Not an auth error
    return false;
  }, [checkTokenAndShowAuthIfNeeded, setErrorCallback]);
  
  return {
    handleAuthError,
    checkTokenAndShowAuthIfNeeded
  };
}