"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSpotifyAuth } from "@contexts/SpotifyAuthContext";

export default function SpotifyCallback() {
  const searchParams = useSearchParams();
  const { handleCallback } = useSpotifyAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const authAttempted = useRef(false);

  const handleAuth = useCallback(async () => {
    const code = searchParams.get("code");
    if (!code || isProcessing || authAttempted.current) {
      return;
    }

    setIsProcessing(true);
    authAttempted.current = true;

    try {
      await handleCallback(code);
    } catch (error) {
      console.error("Spotify auth error:", error);
      // Enhanced error logging to help with troubleshooting
      if (error?.message === "Failed to fetch") {
        console.error(
          "Network error detected in Spotify callback. Check if API server is running at:",
          process.env.NEXT_PUBLIC_API_BASE_URL
        );
      }
      // Re-throw the error so it can be caught by the fetchInterceptor
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [searchParams, handleCallback, isProcessing]);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
