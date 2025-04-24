"use client";

import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { useConnectivityError } from "@/contexts/ConnectivityErrorContext";
import {
  authenticateWithSpotifyCode,
  SPOTIFY_AUTH_URL,
  SPOTIFY_SCOPES,
} from "@/lib/music-tree-api-service/spotify-auth";
import { ErrorCode } from "@/types/app-errors/app-error-codes";
import { ApiError } from "@/types/app-errors/app-error";

export function useSpotifyAuth() {
  const { clearSession, setSession } = useSession();
  const { setConnectivityError } = useConnectivityError();
  const router = useRouter();

  const handleSpotifyAuth = () => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    localStorage.setItem("spotifyAuthRedirect", window.location.href);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const handleCallback = async (code: string) => {
    console.log("handleCallback called", { code });
    const response = await authenticateWithSpotifyCode(code);
    if (!response.ok) {
      const error = new ApiError(ErrorCode.API_AUTH_ERROR);
      setConnectivityError(error);
    } else {
      const data = await response.json();
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
    handleSpotifyAuth,
    handleCallback,
    logout,
  };
}
