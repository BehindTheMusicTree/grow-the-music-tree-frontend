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

    await handleCallback(code);

    setIsProcessing(false);
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
