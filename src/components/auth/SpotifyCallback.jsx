import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "@contexts/popup/usePopup";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";
import SpotifyTokenService from "@utils/services/SpotifyTokenService";
import SpotifyAuthErrorPopupContentObject from "@models/popup-content-object/SpotifyAuthErrorPopupContentObject";
import { FaSpotify } from "react-icons/fa";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { showPopup } = usePopup();
  const authAttemptRef = useRef(false);

  // Function to handle the authentication process
  const processAuthentication = async (code, state) => {
    if (authAttemptRef.current) {
      return;
    }
    authAttemptRef.current = true;

    try {
      const data = await SpotifyOAuthService.handleCallback(code, state || "");

      // Extract any token from the response data
      const tokenValue = data.accessToken || data.token || data.access_token;

      // Check if token was stored correctly
      const storedToken = localStorage.getItem(SpotifyTokenService.SPOTIFY_TOKEN_KEY);

      // Manual storage as a fallback
      if (!storedToken && tokenValue) {
        const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour
        localStorage.setItem(SpotifyTokenService.SPOTIFY_TOKEN_KEY, tokenValue);
        localStorage.setItem(SpotifyTokenService.SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.toString());
      }

      // Check token status
      const hasValidToken = SpotifyTokenService.hasValidSpotifyToken();

      if (hasValidToken) {
        // Set flag to trigger playlists loading
        localStorage.setItem("spotify_auth_completed", Date.now().toString());

        // Navigate to home page
        if (navigate) {
          navigate("/", { state: { authCompleted: true } });
        } else {
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      // Show error popup
      const popupContentObject = new SpotifyAuthErrorPopupContentObject({
        message: error.message || "Authentication failed",
        details: "Please try connecting with Spotify again",
      });
      showPopup(popupContentObject);

      // Navigate back to home after showing error
      navigate("/");
    }
  };

  // Effect to parse URL params and start authentication on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      const popupContentObject = new SpotifyAuthErrorPopupContentObject({
        message: "Authentication was cancelled or failed",
        details: error,
      });
      showPopup(popupContentObject);
      navigate("/");
      return;
    }

    if (!code) {
      const popupContentObject = new SpotifyAuthErrorPopupContentObject({
        message: "Missing authorization code from Spotify",
        details: "Please try connecting with Spotify again",
      });
      showPopup(popupContentObject);
      navigate("/");
      return;
    }

    processAuthentication(code, state);

    return () => {
      authAttemptRef.current = true;
    };
  }, [navigate, showPopup]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-[#1DB954] mb-4 animate-spin">
          <FaSpotify size={40} />
        </div>
        <h1 className="text-xl font-medium text-white mb-2">Spotify Authentication</h1>
        <p className="text-sm text-gray-400 mb-2">Please wait while we connect to Spotify...</p>
      </div>
    </div>
  );
}
