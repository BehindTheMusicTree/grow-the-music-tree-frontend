import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyOAuthService from "@utils/services/SpotifyOAuthService";
import SpotifyTokenService from "@utils/services/SpotifyTokenService";
import { FaSpotify, FaRedo } from "react-icons/fa";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [authCode, setAuthCode] = useState(null);
  const [authState, setAuthState] = useState(null);

  // Use useRef instead of useState for tracking auth attempts
  const authAttemptRef = useRef(false);

  // Function to handle the authentication process
  const processAuthentication = async (code, state) => {
    if (authAttemptRef.current) {
      return;
    }
    authAttemptRef.current = true;

    setIsProcessing(true);
    setError(null);

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
      console.error("Authentication error:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Effect to parse URL params and start authentication on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      console.error("Spotify authentication error from URL:", error);
      setError("Authentication was cancelled or failed");
      setIsProcessing(false);
      return;
    }

    if (!code) {
      console.error("Missing authorization code");
      setError("Missing authorization code from Spotify");
      setIsProcessing(false);
      return;
    }

    setAuthCode(code);
    setAuthState(state);
    processAuthentication(code, state);

    return () => {
      authAttemptRef.current = true;
    };
  }, [navigate]);

  // Handler for retry button
  const handleRetry = () => {
    if (authCode) {
      processAuthentication(authCode, authState);
    } else {
      SpotifyOAuthService.initiateLogin();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl max-w-md">
          <div className="text-[#1DB954] mb-4">
            <FaSpotify size={40} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Authentication Error</h2>
          <div className="text-red-500 mb-6 text-sm">{error}</div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#1DB954] text-white font-medium rounded-full hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Retry Authentication
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-700 text-white font-medium rounded-full hover:bg-opacity-90 transition-all duration-200"
            >
              Return to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className={`text-[#1DB954] mb-4 ${isProcessing ? "animate-spin" : ""}`}>
          <FaSpotify size={40} />
        </div>
        <h1 className="text-xl font-medium text-white mb-2">Spotify Authentication</h1>
        <p className="text-sm text-gray-400 mb-2">Please wait while we connect to Spotify...</p>
      </div>
    </div>
  );
}
