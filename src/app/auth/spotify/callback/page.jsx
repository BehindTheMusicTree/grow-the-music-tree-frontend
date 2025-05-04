"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";

export default function SpotifyOAuthCallback() {
  const router = useRouter();

  // In client components, useSearchParams() already returns the unwrapped value
  // No need for React.use() in client components (marked with "use client")
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  const { authToBackendFromSpotifyCode } = useSpotifyAuth();
  const [isPending, setisPending] = useState(true);
  const [error, setError] = useState(null);
  const authAttempted = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (authAttempted.current) return;
      authAttempted.current = true;

      if (errorParam) {
        setError(new Error(`Spotify authentication failed: ${errorParam}`));
        setisPending(false);
        return;
      }

      if (!code) {
        setError(new Error("No authorization code received from Spotify"));
        setisPending(false);
        return;
      }

      try {
        await authToBackendFromSpotifyCode(code);
        // Redirect to home page on success
        router.push("/");
      } catch (err) {
        if (err instanceof BackendError && err.code === ErrorCode.BACKEND_AUTH_ERROR) {
          setError(new Error("Failed to authenticate with the backend server. Please try again later."));
        } else {
          setError(new Error("An unexpected error occurred. Please try again later."));
        }
      } finally {
        setisPending(false);
      }
    };

    handleAuth();
  }, [authToBackendFromSpotifyCode, router, code, errorParam]);

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
