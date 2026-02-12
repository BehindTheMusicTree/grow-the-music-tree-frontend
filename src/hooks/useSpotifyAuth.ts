"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";
import { LOGOUT_REDIRECT_PATH } from "@lib/constants/routes";

export function useSpotifyAuth() {
  const router = useRouter();
  const { clearSession, setSession } = useSession();
  const { setConnectivityError } = useConnectivityError();
  const { fetch } = useFetchWrapper();

  const handleSpotifyOAuth = () => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      console.error("[SpotifyAuth] Missing Spotify env vars", {
        NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      });
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    const redirectPath = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    const redirectUri = redirectPath.startsWith("http")
      ? redirectPath
      : `${window.location.origin}${redirectPath.startsWith("/") ? "" : "/"}${redirectPath}`;

    localStorage.setItem("spotifyAuthRedirect", window.location.href);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES ?? "",
    });

    window.location.href = `${process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const authToBackendFromSpotifyCode = useCallback(
    async (code: string): Promise<string | null> => {
      const setCreateBackendAuthConnectivityError = () => {
        return setConnectivityError(createAppErrorFromErrorCode(ErrorCode.BACKEND_AUTH_ERROR));
      };
      type BackendSpotifyAuthResponse = {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      };

      try {
        console.log("[SpotifyAuth] calling backend with Spotify code", {
          backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
        });
        const backEndSporifyAuthResponse = await fetch<BackendSpotifyAuthResponse>("auth/spotify/", true, false, {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        if (!backEndSporifyAuthResponse) {
          setCreateBackendAuthConnectivityError();
          return null;
        }
        setSession({
          accessToken: backEndSporifyAuthResponse.accessToken,
          refreshToken: backEndSporifyAuthResponse.refreshToken,
          expiresAt: backEndSporifyAuthResponse.expiresAt,
        });
        const originalUrl = localStorage.getItem("spotifyAuthRedirect");
        if (originalUrl) {
          localStorage.removeItem("spotifyAuthRedirect");
          try {
            const url = new URL(originalUrl);
            return url.pathname + url.search;
          } catch {
            return "/";
          }
        }
        return "/";
      } catch (e) {
        console.log("authToBackendFromSpotifyCode error", e);
        setCreateBackendAuthConnectivityError();
        return null;
      }
    },
    [fetch, setSession, setConnectivityError],
  );

  const logout = useCallback(() => {
    clearSession();
    router.push(LOGOUT_REDIRECT_PATH);
  }, [clearSession, router]);

  return {
    handleSpotifyOAuth,
    authToBackendFromSpotifyCode,
    logout,
  };
}
