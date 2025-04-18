"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSpotifyAuth } from "@contexts/SpotifyAuthContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";

export default function SpotifyCallback() {
  console.log("SpotifyCallback render");
  const searchParams = useSearchParams();
  const { handleCallback } = useSpotifyAuth();
  const { setConnectivityError, ConnectivityErrorType, ErrorCode } = useConnectivityError();
  const [isProcessing, setIsProcessing] = useState(false);
  const authAttempted = useRef(false);

  const handleError = useCallback(() => {
    console.log("handleError called");
    setConnectivityError({
      type: ConnectivityErrorType.SPOTIFY_AUTH_ERROR,
      message: ErrorCode.getMessage(ErrorCode.SPOTIFY_AUTH_ERROR),
      code: ErrorCode.SPOTIFY_AUTH_ERROR,
    });
  }, [ConnectivityErrorType.SPOTIFY_AUTH_ERROR, ErrorCode, setConnectivityError]);

  const handleAuth = useCallback(async () => {
    console.log("handleAuth called", {
      isProcessing,
      authAttempted: authAttempted.current,
      code: searchParams.get("code"),
    });

    const code = searchParams.get("code");
    if (!code || isProcessing || authAttempted.current) {
      console.log("handleAuth early return", { code, isProcessing, authAttempted: authAttempted.current });
      return;
    }

    setIsProcessing(true);
    authAttempted.current = true;

    await handleCallback(code);

    setIsProcessing(false);
  }, [searchParams, handleCallback, isProcessing]);

  useEffect(() => {
    console.log("useEffect triggered");
    handleAuth();
    return () => {
      console.log("useEffect cleanup");
    };
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
