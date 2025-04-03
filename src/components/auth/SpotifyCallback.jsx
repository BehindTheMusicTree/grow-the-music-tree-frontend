import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SpotifyAuthService from "../../utils/services/SpotifyAuthService";
import ApiService from "../../utils/ApiService";
import { FaSpotify } from "react-icons/fa";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      if (error) {
        console.error("Spotify authentication error:", error);
        setError("Authentication was cancelled or failed");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (!code || !state) {
        console.error("Missing code or state");
        setError("Invalid authentication response");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        const data = await SpotifyAuthService.handleCallback(code, state);
        ApiService.setToken(data);
        navigate("/");
      } catch (error) {
        console.error("Failed to handle Spotify callback:", error);
        setError(error.message || "Failed to complete authentication");
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
          <div className="text-red-500 mb-4 text-lg">{error}</div>
          <div className="text-gray-400">Redirecting to home page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="animate-spin text-[#1DB954] mb-4">
          <FaSpotify size={32} />
        </div>
        <h1 className="text-lg font-medium text-white mb-2">Completing Spotify Sign In...</h1>
        <p className="text-sm text-gray-400">Please wait while we process your login</p>
      </div>
    </div>
  );
}
