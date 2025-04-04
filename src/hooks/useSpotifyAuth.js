import { useCallback } from "react";
import { usePopup } from "../contexts/popup/usePopup";
import SpotifyService from "../utils/services/SpotifyService";
import SpotifyAuthService from "../utils/services/SpotifyAuthService";
import SpotifyAuthPopupContentObject from "../models/popup-content-object/SpotifyAuthPopupContentObject";

/**
 * Hook for handling Spotify authentication
 * Provides methods to check token validity and show authentication popup when needed
 */
export default function useSpotifyAuth() {
  const { showPopup } = usePopup();

  /**
   * Check if there's a valid Spotify token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  const hasValidToken = useCallback(() => {
    return SpotifyService.hasValidSpotifyToken();
  }, []);

  /**
   * Shows a non-dismissable Spotify authentication popup
   */
  const showAuthPopup = useCallback(() => {
    const popup = new SpotifyAuthPopupContentObject();
    showPopup(popup);
  }, [showPopup]);

  /**
   * Checks if a valid token exists and shows auth popup if not
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  const checkTokenAndShowPopupIfNeeded = useCallback(() => {
    if (!hasValidToken()) {
      showAuthPopup();
      return false;
    }
    return true;
  }, [hasValidToken, showAuthPopup]);

  /**
   * Initiates the Spotify login process
   */
  const login = useCallback(() => {
    SpotifyAuthService.initiateLogin();
  }, []);

  return {
    hasValidToken,
    showAuthPopup,
    checkTokenAndShowPopupIfNeeded,
    login
  };
}