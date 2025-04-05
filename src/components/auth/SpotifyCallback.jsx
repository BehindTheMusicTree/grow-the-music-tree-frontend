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
      console.log("Authentication already processed for this code, skipping duplicate attempt");
      return;
    }

    // Mark as processed immediately
    authAttemptRef.current = true;

    setIsProcessing(true);
    setError(null);
    setStatusMessage("Processing authentication request...");

    try {
      setStatusMessage("Exchanging authorization code for access token...");
      console.log("Calling SpotifyAuthService.handleCallback with code");

      const data = await SpotifyAuthService.handleCallback(code, state || "");

      console.log("Authentication data received:", Object.keys(data));

      // Extract any token from the response data
      const tokenValue = data.accessToken || data.token || data.access_token;

      // Force a larger delay to ensure token is fully stored before checking
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if token was stored correctly
      const storedToken = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);
      console.log("Token stored correctly:", !!storedToken);

      // Manual storage as a fallback
      if (!storedToken && tokenValue) {
        console.log("Token not found in storage, manually storing from response data");
        const expiryTime = Date.now() + 60 * 60 * 1000; // 1 hour
        localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_KEY, tokenValue);
        localStorage.setItem(SpotifyService.SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.toString());

        // Verify again
        const verifyStoredToken = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);
        console.log("Manual token storage verification:", !!verifyStoredToken);

        if (!verifyStoredToken) {
          console.error("CRITICAL: Failed to store token even with manual fallback");
        }
      }

      // Log Spotify token details for diagnostics
      console.log("Checking token status after authentication");
      const hasValidToken = SpotifyService.hasValidSpotifyToken();

      if (hasValidToken) {
        console.log("Spotify authentication successful, valid token is available");
        setStatusMessage("Authentication successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      } else {
        console.warn("Warning: Spotify token validation failed after authentication");

        // Last resort - force page reload to refresh token state
        console.log("Forcing page reload to refresh token state");
        setStatusMessage("Completing authentication...");
        setTimeout(() => (window.location.href = "/"), 1500);
      }
    } catch (error) {
      console.error("Failed to handle Spotify callback:", error);

      // Provide more specific error messages based on common failure scenarios
      let errorMessage = "Failed to complete authentication";

      if (error.message && error.message.includes("Network error")) {
        errorMessage =
          "Network error connecting to authentication service. Please check your internet connection and try again.";
      } else if (error.message && error.message.includes("State verification")) {
        errorMessage = "Authentication security check failed. Please try signing in again.";
      } else if (error.message && error.message.includes("Failed to authenticate")) {
        // Check specifically for invalid_grant errors
        if (error.message.includes("invalid_grant")) {
          errorMessage = "This authentication code has expired or was already used. Please try signing in again.";
          // Reset auth attempt tracking for retry
          authAttemptRef.current = false;
        } else {
          errorMessage = "Spotify authentication service is unavailable. Please try again later.";
        }
      } else if (error.message && error.message.includes("500")) {
        errorMessage = "Authentication server error. Please try again later.";
      }

      setError(errorMessage);
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
