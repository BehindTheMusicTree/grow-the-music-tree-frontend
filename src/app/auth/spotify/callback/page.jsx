"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSpotifyAuth } from "@/contexts/SpotifyAuthContext";
import { useAppError } from "@/contexts/AppErrorContext";
import { ErrorCode } from "@/lib/connectivity-errors/codes";

export default function SpotifyCallback() {
  const searchParams = useSearchParams();
  const { handleCallback } = useSpotifyAuth();
  const processingRef = useRef(false);
  const { setConnectivityError, ConnectivityErrorType } = useAppError();

  const handleAuth = useCallback(async () => {
    const code = searchParams.get("code");
    if (!code || processingRef.current) {
      return;
    }

    processingRef.current = true;

    try {
      await handleCallback(code);
    } catch (error) {
      console.error("Authentication error:", error);
      setConnectivityError({
        type: ConnectivityErrorType.INTERNAL,
        message: ErrorCode.getMessage(ErrorCode.INTERNAL),
        debugCode: ErrorCode.INTERNAL,
      });
    } finally {
      processingRef.current = false;
    }
  }, [searchParams, handleCallback, setConnectivityError, ConnectivityErrorType]);

  useEffect(() => {
    // Run authentication process once on mount
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
