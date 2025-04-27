"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@contexts/SessionContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { createAppErrorFromErrorCode } from "@app-types/app-errors/app-error-factory";

export function useSpotifyAuth() {
  const { clearSession, setSession } = useSession();
  const { setConnectivityError } = useConnectivityError();
  const router = useRouter();
  const { fetch } = useFetchWrapper();

  const handleSpotifyOAuth = () => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    localStorage.setItem("spotifyAuthRedirect", window.location.href);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES ?? "",
    });

    window.location.href = `${process.env.NEXT_PUBLIC_SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const authToBackendFromSpotifyCode = useCallback(
    async (code: string) => {
      const setCreateBackendAuthConnectivityError = () => {
        return setConnectivityError(createAppErrorFromErrorCode(ErrorCode.BACKEND_AUTH_ERROR));
      };
      console.log("authToBackendFromSpotifyCode called", { code });
      type BackendSpotifyAuthResponse = {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      };
      try {
        const backEndSporifyAuthResponse = await fetch<BackendSpotifyAuthResponse>("auth/spotify/", true, false, {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        if (!backEndSporifyAuthResponse) {
          setCreateBackendAuthConnectivityError();
        } else {
          setSession({
            accessToken: backEndSporifyAuthResponse.accessToken,
            refreshToken: backEndSporifyAuthResponse.refreshToken,
            expiresAt: backEndSporifyAuthResponse.expiresAt,
          });
        }

        const originalUrl = localStorage.getItem("spotifyAuthRedirect");
        if (originalUrl) {
          localStorage.removeItem("spotifyAuthRedirect");
          // router.push(originalUrl);
        } else {
          // router.push("/");
        }
      } catch (e) {
        console.log("authToBackendFromSpotifyCode error", e);
        setCreateBackendAuthConnectivityError();
      }
    },
    [fetch, setSession, setConnectivityError]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return {
    handleSpotifyOAuth,
    authToBackendFromSpotifyCode,
    logout,
  };
}
