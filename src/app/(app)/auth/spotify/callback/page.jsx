"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

function getParamsFromUrl() {
  if (typeof window === "undefined") return { code: null, errorParam: null };
  const params = new URLSearchParams(window.location.search);
  return {
    code: params.get("code"),
    errorParam: params.get("error"),
  };
}

export default function SpotifyOAuthCallbackPage() {
  const router = useRouter();
  const { authToBackendFromSpotifyCode } = useSpotifyAuth();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);
  const authAttempted = useRef(false);

  useEffect(() => {
    console.log("[SpotifyCallback] effect start");
    const { code, errorParam } = getParamsFromUrl();
    console.log("[SpotifyCallback] params", { code, errorParam });

    const handleAuth = async () => {
      if (authAttempted.current) return;
      authAttempted.current = true;

      console.log("[SpotifyCallback] handleAuth start");

      if (errorParam) {
        console.log("[SpotifyCallback] error param present", errorParam);
        setError(new Error(`Spotify authentication failed: ${errorParam}`));
        setIsPending(false);
        return;
      }

      if (!code) {
        console.log("[SpotifyCallback] no code in URL");
        setError(new Error("No authorization code received from Spotify"));
        setIsPending(false);
        return;
      }

      try {
        console.log("[SpotifyCallback] calling authToBackendFromSpotifyCode");
        const redirectUrl = await authToBackendFromSpotifyCode(code);
        console.log("[SpotifyCallback] authToBackendFromSpotifyCode returned", redirectUrl);
        if (redirectUrl) {
          console.log("[SpotifyCallback] redirecting to", redirectUrl);
          router.push(redirectUrl);
        }
      } catch (err) {
        console.error("[SpotifyCallback] error during auth", err);
        if (err instanceof BackendError && err.code === ErrorCode.BACKEND_AUTH_ERROR) {
          setError(new Error("Failed to authenticate with the backend server. Please try again later."));
        } else {
          setError(new Error("An unexpected error occurred. Please try again later."));
        }
      } finally {
        setIsPending(false);
      }
    };

    handleAuth().catch((e) => {
      console.error("[SpotifyCallback] unhandled error in handleAuth", e);
    });
  }, [authToBackendFromSpotifyCode, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connecting to Spotify...</h1>
          <p className="text-gray-600">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-md w-full">
          <h2 className="text-red-500 font-semibold mb-2">Authentication Error</h2>
          <p className="text-red-500/80">{error.message}</p>
        </div>
      </div>
    );
  }

  return null;
}
