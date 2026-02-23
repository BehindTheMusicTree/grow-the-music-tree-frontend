"use client";

import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import {
  exchangeCodeWithBackend,
  resolveRedirectUri,
  SPOTIFY_EXCHANGE_CONFIG,
  storeRedirectUrl,
} from "@lib/auth/code-exchange";

export function useSpotifyAuth() {
  const { setSession } = useSession();
  const { setConnectivityError } = useConnectivityError();
  const { fetch } = useFetchWrapper();

  const handleSpotifyOAuth = (redirectAfterAuthPath?: string) => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      console.error("[SpotifyAuth] Missing Spotify env vars", {
        NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      });
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    const redirectUri = resolveRedirectUri(process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI);
    storeRedirectUrl(SPOTIFY_EXCHANGE_CONFIG.redirectStorageKey, redirectAfterAuthPath);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES ?? "",
    });

    window.location.href = `${process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const authToBackendFromSpotifyCode = useCallback(
    async (code: string) =>
      exchangeCodeWithBackend(
        fetch,
        setSession,
        setConnectivityError,
        SPOTIFY_EXCHANGE_CONFIG,
        code,
      ),
    [fetch, setSession, setConnectivityError],
  );

  return {
    handleSpotifyOAuth,
    authToBackendFromSpotifyCode,
  };
}
