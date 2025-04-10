import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "@contexts/PopupContext";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";
import ApiTokenService from "@utils/services/ApiTokenService";
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
      console.log("Auth response data:", data);

      // Extract token from the response data
      const tokenValue = data.accessToken;
      console.log("Token value:", tokenValue ? "Present" : "Missing");

      if (!tokenValue) {
        throw new Error("No access token in response");
      }

      // Store the token using ApiTokenService
      ApiTokenService.saveApiToken(
        tokenValue,
        3600, // 1 hour in seconds
        null, // No refresh token in this flow
        data.user // Store user profile
      );

      // Check token status
      console.log("[SpotifyCallback] Checking token status");
      const hasValidToken = ApiTokenService.hasValidApiToken();
      console.log("Has valid token:", hasValidToken);

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
        throw new Error("Token validation failed after storage");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      // Show error popup
      const popupContentObject = new SpotifyAuthErrorPopupContentObject({
        message: "Authentication Failed",
        details:
          "Something went wrong with the authentication. Please try again or contact our team if the issue persists.",
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
        message: "Authentication Failed",
        details:
          "Something went wrong with the authentication. Please try again or contact our team if the issue persists.",
      });
      showPopup(popupContentObject);
      navigate("/");
      return;
    }

    if (!code) {
      const popupContentObject = new SpotifyAuthErrorPopupContentObject({
        message: "Authentication Failed",
        details:
          "Something went wrong with the authentication. Please try again or contact our team if the issue persists.",
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
