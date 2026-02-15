"use client";

import { useCallback } from "react";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import {
  BackendSpotifyUserNotAllowlistedError,
  BackendError,
} from "@app-types/app-errors/app-error";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";

export function useSpotifyAuth() {
  const { clearSession, setSession } = useSession();
  const { setConnectivityError, clearConnectivityError } = useConnectivityError();
  const { fetch } = useFetchWrapper();

  const handleSpotifyOAuth = (redirectAfterAuthPath?: string) => {
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

    const urlToStore = redirectAfterAuthPath
      ? `${window.location.origin}${redirectAfterAuthPath.startsWith("/") ? "" : "/"}${redirectAfterAuthPath}`
      : window.location.href;
    localStorage.setItem("spotifyAuthRedirect", urlToStore);

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
        if (
          e instanceof BackendSpotifyUserNotAllowlistedError ||
          (e instanceof BackendError &&
            e.code === ErrorCode.BACKEND_SPOTIFY_USER_NOT_ALLOWLISTED)
        ) {
          throw e;
        }
        console.log("authToBackendFromSpotifyCode error", e);
        setCreateBackendAuthConnectivityError();
        return null;
      }
    },
    [fetch, setSession, setConnectivityError],
  );

  const logout = useCallback(() => {
    clearConnectivityError();
    clearSession();
  }, [clearConnectivityError, clearSession]);

  return {
    handleSpotifyOAuth,
    authToBackendFromSpotifyCode,
    logout,
  };
}
