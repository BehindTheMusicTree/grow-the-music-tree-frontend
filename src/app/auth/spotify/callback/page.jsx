"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";

export default function SpotifyOAuthCallback() {
  const searchParams = useSearchParams();
  const { authToBackendFromSpotifyCode } = useSpotifyAuth();
  const processingRef = useRef(false);
  const { setConnectivityError } = useConnectivityError();

  const handleOAuthCallback = useCallback(async () => {
    console.log("handleOAuthCallback called");
    const code = searchParams.get("code");
    if (!code || processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      await authToBackendFromSpotifyCode(code);
    } catch (error) {
      console.error("Authentication error:", error);
      setConnectivityError(createAppErrorFromErrorCode(ErrorCode.BACKEND_AUTH_ERROR));
    } finally {
      processingRef.current = false;
    }
  }, [searchParams, authToBackendFromSpotifyCode, setConnectivityError]);

  useEffect(() => {
    // Run authentication process once on mount
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
