"use client";

import { useSession } from "@contexts/SessionContext";
import { useRouter } from "next/navigation";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { BackendError } from "@app-types/app-errors/app-error";
import { useFetchWrapper } from "@hooks/useFetchWrapper";

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

  const authToBackendFromSpotifyCode = async (code: string) => {
    console.log("authToBackendFromSpotifyCode called", { code });
    type SpotifyAuthResponse = {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    const response = await fetch<Response>("auth/spotify/", true, false, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    if (!response?.ok) {
      const error = new BackendError(ErrorCode.BACKEND_AUTH_ERROR);
      setConnectivityError(error);
    } else {
      const data = (await response.json()) as SpotifyAuthResponse;
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });

      const originalUrl = localStorage.getItem("spotifyAuthRedirect");
      if (originalUrl) {
        localStorage.removeItem("spotifyAuthRedirect");
        // router.push(originalUrl);
      } else {
        // router.push("/");
      }
    }
  };

  const logout = () => {
    clearSession();
  };

  return {
    handleSpotifyOAuth,
    authToBackendFromSpotifyCode,
    logout,
  };
}
