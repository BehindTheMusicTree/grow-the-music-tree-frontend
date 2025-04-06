import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyAuthService from "../../utils/services/SpotifyAuthService";
import SpotifyService from "../../utils/services/SpotifyService";
import { FaSpotify, FaRedo } from "react-icons/fa";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Please wait while we process your login");
  const [isProcessing, setIsProcessing] = useState(true);
  const [authCode, setAuthCode] = useState(null);
  const [authState, setAuthState] = useState(null);

  // Use useRef instead of useState for tracking auth attempts
  // This is more reliable in React's StrictMode which can cause components
  // to mount twice in development
  const authAttemptRef = useRef(false);

  // Function to handle the authentication process
  const processAuthentication = async (code, state) => {
    // Prevent multiple auth attempts using ref
    if (authAttemptRef.current) {
      return;
    }

    // Mark as processed immediately
    authAttemptRef.current = true;

    setIsProcessing(true);
    setError(null);
    setStatusMessage("Processing authentication request...");

    try {
      setStatusMessage("Exchanging authorization code for access token...");

      const data = await SpotifyAuthService.handleCallback(code, state || "");

      // Extract any token from the response data
      const tokenValue = data.accessToken || data.token || data.access_token;

      // Force a larger delay to ensure token is fully stored before checking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if token was stored correctly
      const storedToken = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);

      // Manual storage as a fallback
      if (!storedToken && tokenValue) {
        const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour
        localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_KEY, tokenValue);
        localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.toString());

        // Verify again
        const verifyStoredToken = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);
        if (!verifyStoredToken) {
          throw new Error("Failed to store token");
        }
      }

      // Check token status
      const hasValidToken = SpotifyService.hasValidSpotifyToken();

      if (hasValidToken) {
        setStatusMessage("Authentication successful! Redirecting...");

        // Set flag to trigger playlists loading
        localStorage.setItem("spotify_auth_completed", Date.now().toString());

        // Increased delay to ensure all state is fully processed
        setTimeout(() => {
          if (navigate) {
            navigate("/", { state: { authCompleted: true, timestamp: Date.now() } });
          } else {
            window.location.href = "/?auth_completed=true";
          }
        }, 1500);
      } else {
        setStatusMessage("Completing authentication...");

        // Set the flag before redirecting
        localStorage.setItem("spotify_auth_completed", Date.now().toString());

        setTimeout(() => {
          window.location.href = "/?force_reload=true";
        }, 1500);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
      setStatusMessage("Authentication failed");
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

    // State can be missing in some scenarios, but we'll proceed with a warning
    if (!state) {
      console.warn("Missing state parameter - proceeding anyway");
      setStatusMessage("Proceeding with authentication (missing state)");
    }

    // Store these for potential retries
    setAuthCode(code);
    setAuthState(state);

    // Start the authentication process
    processAuthentication(code, state);

    // Cleanup function to prevent memory leaks
    return () => {
      // Mark as processed in case component unmounts
      authAttemptRef.current = true;
    };
  }, [navigate]);

  // Handler for retry button
  const handleRetry = () => {
    if (authCode) {
      processAuthentication(authCode, authState);
    } else {
      // If we somehow lost the code, go back to login
      SpotifyAuthService.initiateLogin();
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
        <p className="text-sm text-gray-400 mb-2">{statusMessage}</p>

        {isProcessing && (
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-[#1DB954] h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}
