import { useCallback, useRef } from "react";
import ApiTokenService from "../utils/services/ApiTokenService";

/**
 * A generic hook for handling authentication changes across the application.
 * Used by contexts that need to react to authentication state changes.
 *
 * @param {Object} options Configuration options
 * @param {Function} options.refreshCallback Function to call when a refresh is needed
 * @param {Function} options.updateAuthStateCallback Optional function to update auth state
 * @param {string[]} options.authKeys localStorage keys to listen for (defaults to common auth keys)
 * @param {boolean} options.refreshRef.current Flag to track if a refresh is in progress
 * @param {number} options.tokenCheckDelay Delay before checking token (ms) after storage event
 * @param {number} options.refreshDebounce Debounce time for refresh signals (ms)
 * @returns {Object} Handler functions and utilities
 */
export default function useAuthChangeHandler({
  refreshCallback,
  updateAuthStateCallback,
  authKeys = ["spotify_auth_completed", "spotify_token_data"],
  isFetchingRef,
  refreshInProgressRef,
  tokenCheckDelay = 500,
  refreshDebounce = 100,
}) {
  // Create local refs for use when params aren't provided
  const localFetchingRef = useRef(false);
  const localRefreshInProgressRef = useRef(false);

  // Use provided refs or fall back to local ones
  const actualFetchingRef = isFetchingRef || localFetchingRef;
  const actualRefreshInProgressRef = refreshInProgressRef || localRefreshInProgressRef;
  // Reference to track previous auth state to detect changes
  const prevAuthStateRef = useRef(ApiTokenService.hasValidApiToken());

  /**
   * Handler for storage events related to authentication
   */
  const handleStorageChange = useCallback(
    async (e) => {
      // Check if the storage change is relevant to authentication
      if (!authKeys.includes(e.key)) return;

      // If it's the completion flag, remove it to prevent duplicate processing
      if (e.key === "spotify_auth_completed") {
        localStorage.removeItem("spotify_auth_completed");
      }

      // Wait for token to stabilize
      await new Promise((resolve) => setTimeout(resolve, tokenCheckDelay));

      // Prevent concurrent operations
      if (actualFetchingRef.current || actualRefreshInProgressRef.current) return;

      try {
        // Get current auth state
        console.log("[useAuthChangeHandler handleStorageChange] Checking token status");
        const isTokenValid = ApiTokenService.hasValidApiToken();

        // Update auth state if provided
        if (updateAuthStateCallback) {
          updateAuthStateCallback(isTokenValid);
        }

        // Check if auth state changed
        if (isTokenValid !== prevAuthStateRef.current) {
          prevAuthStateRef.current = isTokenValid;
        }

        // Trigger refresh if we have a valid token and a callback
        if (isTokenValid && refreshCallback && !actualRefreshInProgressRef.current) {
          actualRefreshInProgressRef.current = true;
          refreshCallback();

          // Reset refresh flag after debounce
          setTimeout(() => {
            actualRefreshInProgressRef.current = false;
          }, refreshDebounce);
        }
      } catch (error) {
        console.error("[useAuthChangeHandler] Error handling storage change:", error);
      }
    },
    [
      authKeys,
      tokenCheckDelay,
      actualFetchingRef,
      actualRefreshInProgressRef,
      updateAuthStateCallback,
      refreshCallback,
      refreshDebounce,
    ]
  );

  /**
   * Handler for visibility changes (app focus/unfocus)
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      // Update auth state if provided
      if (updateAuthStateCallback) {
        const isTokenValid = ApiTokenService.hasValidApiToken();
        updateAuthStateCallback(isTokenValid);
        prevAuthStateRef.current = isTokenValid;
      }

      // Check if there's an auth completion flag and handle it
      if (localStorage.getItem("spotify_auth_completed")) {
        handleStorageChange({ key: "spotify_auth_completed" });
      }
    }
  }, [handleStorageChange, updateAuthStateCallback]);

  /**
   * Registers event listeners for auth changes
   * Call this in a useEffect with an empty dependency array
   * and return the unregisterListeners function for cleanup
   */
  const registerListeners = useCallback(() => {
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleStorageChange, handleVisibilityChange]);

  /**
   * Checks current auth state and triggers refresh if needed
   */
  const checkAuthAndRefresh = useCallback(async () => {
    console.log("[useAuthChangeHandler] Checking token status");
    const currentAuthState = ApiTokenService.hasValidApiToken();

    // Update auth state if provided
    if (updateAuthStateCallback) {
      updateAuthStateCallback(currentAuthState);
    }

    // Update saved value
    prevAuthStateRef.current = currentAuthState;

    // Trigger refresh if token is valid
    if (currentAuthState && refreshCallback && !actualRefreshInProgressRef.current) {
      actualRefreshInProgressRef.current = true;
      refreshCallback();

      // Reset refresh flag after debounce
      setTimeout(() => {
        actualRefreshInProgressRef.current = false;
      }, refreshDebounce);
    }

    return currentAuthState;
  }, [updateAuthStateCallback, refreshCallback, actualRefreshInProgressRef, refreshDebounce]);

  return {
    handleStorageChange,
    handleVisibilityChange,
    registerListeners,
    checkAuthAndRefresh,
  };
}
