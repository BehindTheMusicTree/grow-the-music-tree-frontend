import { useCallback } from "react";
import { useNotification } from "@contexts/NotificationContext";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";

export default function useSpotifyAuth() {
  const { showLoading } = useNotification();

  const login = useCallback(() => {
    showLoading("Connecting to Spotify...");
    SpotifyOAuthService.initiateLogin();
  }, [showLoading]);

  return {
    login,
  };
}
