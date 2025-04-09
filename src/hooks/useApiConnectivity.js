import { useCallback, useRef } from "react";
import { usePopup } from "../contexts/popup/usePopup";
import ConnectivityErrorPopupContentObject from "../models/popup-content-object/ConnectivityErrorPopupContentObject";

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
export default function useApiConnectivity() {
  const { showPopup } = usePopup();
  const hasShownErrorRef = useRef(false);

  const showConnectivityErrorPopup = useCallback(
    (errorDetails) => {
      // Only show once per page load
      if (hasShownErrorRef.current) {
        return;
      }

      hasShownErrorRef.current = true;
      const popupContent = new ConnectivityErrorPopupContentObject("server_not_found", errorDetails);
      showPopup(popupContent);
    },
    [showPopup]
  );

  const handleApiError = useCallback(
    (error, endpoint) => {
      if (error.status === 401 || error.name === "UnauthorizedRequestError") {
        return;
      }

      const isConnectivityError =
        error.status === 404 ||
        error.status === 500 ||
        (error.status >= 502 && error.status <= 504) ||
        error.name === "TypeError" ||
        error.message?.includes("Failed to fetch");

      if (isConnectivityError) {
        showConnectivityErrorPopup({
          message: "The server is unavailable. Please refresh the page to try again.",
          endpoint,
        });
        return true;
      }

      return false;
    },
    [showConnectivityErrorPopup]
  );

  return {
    handleApiError,
    showConnectivityErrorPopup,
  };
}
