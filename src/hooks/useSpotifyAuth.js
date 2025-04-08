import { useState, useEffect, useCallback } from "react";
import { usePopup } from "@contexts/popup/usePopup";
import { useNotification } from "@contexts/notification/useNotification";
import ApiTokenService from "@utils/services/ApiTokenService";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";
import SpotifyAuthPopupContentObject from "@models/popup-content-object/SpotifyAuthPopupContentObject";
import SpotifyAuthErrorPopupContentObject from "@models/popup-content-object/SpotifyAuthErrorPopupContentObject";

/**
 * Hook for handling Spotify authentication
 * Provides methods for both blocking and non-blocking authentication flows
 */
export default function useSpotifyAuth() {
  const { showPopup } = usePopup();
  const { showLoading } = useNotification();

  /**
   * Check if there's a valid Spotify token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  const hasValidToken = useCallback(() => {
    console.log("[useSpotifyAuth] Checking for valid token");
    return ApiTokenService.hasValidApiToken();
  }, []);

  /**
   * Shows a non-dismissable Spotify authentication popup (blocking)
   * Use this for operations that absolutely require authentication
   */
  const showAuthPopup = useCallback(() => {
    const popup = new SpotifyAuthPopupContentObject();
    showPopup(popup);
  }, [showPopup]);

  /**
   * Shows a non-blocking Spotify authentication notification
   * User can continue browsing while deciding whether to authenticate
   */
  const showAuthNotification = useCallback(() => {
    // Create clickable notification with action button
    const notificationElement = document.createElement("div");
    notificationElement.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">Connect to access Spotify features</span>
        <button class="px-2 py-1 bg-[#1DB954] text-white rounded-md text-xs flex items-center">
          <span class="mr-1">Connect</span>
        </button>
      </div>
    `;

    // Add click handler for the button
    const button = notificationElement.querySelector("button");
    if (button) {
      button.addEventListener("click", () => {
        showLoading("Connecting to Spotify...");
        SpotifyOAuthService.initiateLogin();
      });
    }

    return notificationElement;
  }, [showLoading]);

  /**
   * Checks if a valid token exists and shows auth notification if not
   * Non-blocking version - user can continue browsing
   * @param {boolean} blocking Whether to use blocking popup (true) or non-blocking notification (false)
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  const checkTokenAndShowAuthIfNeeded = useCallback(
    (blocking = false) => {
      console.log("[useSpotifyAuth checkTokenAndShowAuthIfNeeded] Checking token status");
      if (!hasValidToken()) {
        if (blocking) {
          showAuthPopup();
        } else {
          showAuthNotification();
        }
        return false;
      }
      return true;
    },
    [hasValidToken, showAuthPopup, showAuthNotification]
  );

  /**
   * Initiates the Spotify login process with loading indicator
   */
  const login = useCallback(() => {
    showLoading("Connecting to Spotify...");
    SpotifyOAuthService.initiateLogin();
  }, [showLoading]);

  return {
    hasValidToken,
    showAuthPopup,
    showAuthNotification,
    checkTokenAndShowAuthIfNeeded,
    login,
  };
}
