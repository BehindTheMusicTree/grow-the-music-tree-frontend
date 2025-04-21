"use client";

import { useSession } from "@contexts/SessionContext";
import { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";

import { authenticateWithSpotifyCode } from "@lib/music-tree-api-service/spotify-auth";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";

const SpotifyAuthContext = createContext();

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (!context) {
    throw new Error("useSpotifyAuth must be used within a SpotifyAuthProvider");
  }
  return context;
};

export const SpotifyAuthProvider = ({ children }) => {
  const { updateSession } = useSession();
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
    async (code) => {
      console.log("handleCallback called", { code });
      const data = await authenticateWithSpotifyCode(code);
      updateSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        spotifyUser: data.user,
      });

      // Get the original URL from localStorage and redirect back
      const originalUrl = localStorage.getItem("spotifyAuthRedirect");
      if (originalUrl) {
        localStorage.removeItem("spotifyAuthRedirect");
        router.push(originalUrl);
      } else {
        // Fallback to home page if no original URL is found
        router.push("/");
      }
    },
    [updateSession, router]
  );

  const logout = () => {
    updateSession(null);
  };

  const value = {
    handleSpotifyAuth,
    handleCallback,
    logout,
  };

  return <SpotifyAuthContext.Provider value={value}>{children}</SpotifyAuthContext.Provider>;
};
