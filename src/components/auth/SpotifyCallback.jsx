import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyAuthService from "../../utils/services/SpotifyAuthService";
import ApiService from "../../utils/ApiService";
import { FaSpotify, FaRedo } from "react-icons/fa";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Please wait while we process your login");
  const [isProcessing, setIsProcessing] = useState(true);
  const [authCode, setAuthCode] = useState(null);
  const [authState, setAuthState] = useState(null);

  // Function to handle the authentication process
  const processAuthentication = async (code, state) => {
    setIsProcessing(true);
    setError(null);
    setStatusMessage("Processing authentication request...");

    try {
      setStatusMessage("Exchanging authorization code for access token...");
      console.log("Calling SpotifyAuthService.handleCallback with code");

      const data = await SpotifyAuthService.handleCallback(code, state || "");

      console.log("Authentication data received:", Object.keys(data));

      // Store the JWT token from API response
      if (data.token) {
        ApiService.setToken(data.token);
        console.log("JWT token stored");
      }

      // If we have Spotify tokens directly, they're already stored by the service
      if (data.access_token) {
        console.log("Spotify tokens received and stored");
      }

      setStatusMessage("Authentication successful! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
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
        errorMessage = "Spotify authentication service is unavailable. Please try again later.";
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
