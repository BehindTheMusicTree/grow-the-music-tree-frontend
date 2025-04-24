"use client";

import { useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useConnectivityError } from "@/contexts/ConnectivityErrorContext";

interface SpotifyAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string;
}

const spotifyAuthConfig: SpotifyAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "",
  scopes: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES || "",
};

export function useSpotifyAuth() {
  const { session, setSession } = useSession();
  const { setAppError: setConnectivityError, ConnectivityErrorType } = useConnectivityError();

  const login = useCallback(() => {
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", spotifyAuthConfig.clientId);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("redirect_uri", spotifyAuthConfig.redirectUri);
    authUrl.searchParams.append("scope", spotifyAuthConfig.scopes);
    window.location.href = authUrl.toString();
  }, []);

  const logout = useCallback(() => {
    setSession({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  }, [setSession]);

  const handleAuthCallback = useCallback(
    (hash: string) => {
      try {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");

        if (!accessToken) {
          setConnectivityError({
            type: ConnectivityErrorType.AUTH_REQUIRED,
            message: getMessage(ErrorCode.AUTH_REQUIRED),
            code: ErrorCode.AUTH_REQUIRED,
          });
          return;
        }

        setSession({
          user: null, // User info would be fetched separately
          accessToken,
          isAuthenticated: true,
        });
      } catch (error) {
        setConnectivityError({
          type: ConnectivityErrorType.INTERNAL,
          message: getMessage(ErrorCode.INTERNAL),
          code: ErrorCode.INTERNAL,
        });
      }
    },
    [setConnectivityError, setSession]
  );

  return {
    isAuthenticated: session.isAuthenticated,
    login,
    logout,
    handleAuthCallback,
  };
}
