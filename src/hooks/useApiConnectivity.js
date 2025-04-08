import { useCallback, useEffect, useRef } from "react";
import { usePopup } from "../contexts/popup/usePopup";
import ConnectivityErrorPopupContentObject from "../models/popup-content-object/ConnectivityErrorPopupContentObject";
import useAuthChangeHandler from "./useAuthChangeHandler";

/**
 * Custom hook for handling API connectivity issues
 * Integrates with server availability tracking and auth state
 * to provide unified error handling and display
 *
 * @param {Object} options Configuration options
 * @param {Function} options.refreshCallback Function to trigger data refresh
 * @param {Object} options.fetchingRef Reference to track if fetching is in progress
 * @param {boolean} options.autoHandleAuthChanges Whether to auto-handle auth changes
 * @returns {Object} Connectivity utilities and handlers
 */
export default function useApiConnectivity({
  refreshCallback,
  fetchingRef,
  refreshInProgressRef,
  autoHandleAuthChanges = true,
}) {
  // Create refs at the top level (unconditionally)
  const localFetchingRef = useRef(false);
  const localRefreshInProgressRef = useRef(false);

  // Use provided refs or fall back to local ones
  const actualFetchingRef = fetchingRef || localFetchingRef;
  const actualRefreshInProgressRef = refreshInProgressRef || localRefreshInProgressRef;
  const { showPopup } = usePopup();
  const lastConnectivityErrorRef = useRef(0);
  const connectivityErrorCooldown = 30000; // 30 seconds cooldown for connectivity errors

  // Setup auth change handling
  const { handleStorageChange, handleVisibilityChange, registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback,
    isFetchingRef: actualFetchingRef,
    refreshInProgressRef: actualRefreshInProgressRef,
  });

  /**
   * Shows a connectivity error popup with appropriate type and message
   * Includes cooldown to prevent multiple popups for the same issue
   */
  const showConnectivityErrorPopup = useCallback(
    (errorDetails) => {
      const now = Date.now();
      // Don't show another popup if we're in cooldown period
      if (now - lastConnectivityErrorRef.current < connectivityErrorCooldown) {
        return;
      }

      // Update last notification timestamp
      lastConnectivityErrorRef.current = now;

      // Create popup content with server_not_found type
      const popupContent = new ConnectivityErrorPopupContentObject("server_not_found", errorDetails);

      // Show popup
      showPopup(popupContent);
    },
    [showPopup, connectivityErrorCooldown]
  );

  /**
   * Handles API errors, detecting connectivity issues
   * Can be used directly as an error handler for API calls
   */
  const handleApiError = useCallback(
    (error, endpoint) => {
      // Only handle non-auth errors (auth errors are handled separately)
      if (error.status === 401 || error.name === "UnauthorizedRequestError") {
        return;
      }

      // Check if the error is a connectivity error (404, 500, network error)
      const isConnectivityError =
        error.status === 404 ||
        error.status === 500 ||
        (error.status >= 502 && error.status <= 504) ||
        error.name === "TypeError" ||
        error.message?.includes("Failed to fetch");

      if (isConnectivityError) {
        // Show connectivity error popup with endpoint details
        showConnectivityErrorPopup({
          message: "The server appears to be unavailable or unreachable.",
          endpoint,
        });
        return true;
      }

      return false;
    },
    [showConnectivityErrorPopup]
  );

  // Set up event listeners if auto-handling auth changes is enabled
  useEffect(() => {
    if (autoHandleAuthChanges) {
      return registerListeners();
    }
  }, [autoHandleAuthChanges, registerListeners]);

  return {
    handleApiError,
    showConnectivityErrorPopup,
    handleStorageChange,
    handleVisibilityChange,
    checkAuthAndRefresh,
  };
}
