"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSpotifyAuth } from "@contexts/SpotifyAuthContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useSpotifyAuth();
  const { setConnectivityError, ConnectivityErrorType, ErrorCode } = useConnectivityError();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.push("/");
      return;
    }

    const handleAuth = async () => {
      try {
        await handleCallback(code);
        router.push("/");
      } catch (error) {
        console.error("Failed to exchange Spotify code:", error);
        setConnectivityError({
          type: ConnectivityErrorType.SPOTIFY_AUTH_ERROR,
          message: ErrorCode.getMessage(ErrorCode.SPOTIFY_AUTH_ERROR),
          code: ErrorCode.SPOTIFY_AUTH_ERROR,
        });
        router.push("/");
      }
    };

    handleAuth();
  }, [searchParams, router, handleCallback, setConnectivityError, ConnectivityErrorType, ErrorCode]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
