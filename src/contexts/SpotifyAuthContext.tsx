"use client";

import { useSession } from "@/contexts/SessionContext";
import { createContext, useContext, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useConnectivityError } from "@/contexts/AppErrorContext";
import { authenticateWithSpotifyCode, SpotifyAuthResponse } from "@/lib/music-tree-api-service/spotify-auth";
import { ErrorCode } from "@/lib/errors/codes";

interface SpotifyAuthContextType {
  handleSpotifyAuth: () => void;
  handleCallback: (code: string) => Promise<void>;
  logout: () => void;
}

const SpotifyAuthContext = createContext<SpotifyAuthContextType | null>(null);

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (!context) {
    throw new Error("useSpotifyAuth must be used within a SpotifyAuthProvider");
  }
  return context;
};

interface SpotifyAuthProviderProps {
  children: ReactNode;
}

export const SpotifyAuthProvider = ({ children }: SpotifyAuthProviderProps) => {
  const { updateSession } = useSession();
  const { setAppError: setConnectivityError, connectivityErrorTypes } = useConnectivityError();
  const router = useRouter();

  const handleSpotifyAuth = () => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    // Store the current URL before redirecting to Spotify auth
    localStorage.setItem("spotifyAuthRedirect", window.location.href);

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES,
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const handleCallback = useCallback(
    async (code: string) => {
      console.log("handleCallback called", { code });
      const response = await authenticateWithSpotifyCode(code);
      if (!response.ok) {
        setConnectivityError({
          message: "Failed to authenticate to API from Spotify code",
          type: connectivityErrorTypes.INTERNAL,
          error: response.error,
          errorCode: ErrorCode.SPOTIFY_AUTH_CALLBACK_FAILED,
        });
      } else {
        const data = (await response.json()) as SpotifyAuthResponse;
        updateSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          spotifyUser: data.spotifyUser,
        });

        // Get the original URL from localStorage and redirect back
        const originalUrl = localStorage.getItem("spotifyAuthRedirect");
        if (originalUrl) {
          localStorage.removeItem("spotifyAuthRedirect");
          // router.push(originalUrl);
        } else {
          // Fallback to home page if no original URL is found
          // router.push("/");
        }
      }
    },
    [updateSession]
  );

  const logout = () => {
    updateSession(null);
  };

  const value: SpotifyAuthContextType = {
    handleSpotifyAuth,
    handleCallback,
    logout,
  };

  return <SpotifyAuthContext.Provider value={value}>{children}</SpotifyAuthContext.Provider>;
};
