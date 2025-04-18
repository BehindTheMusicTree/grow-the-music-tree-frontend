"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "@contexts/SessionContext";
import { exchangeSpotifyCode } from "@lib/api-service/spotify-auth";

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
  const { data: session, status, updateSession } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (session?.accessToken) {
      setIsAuthenticated(true);
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      setExpiresAt(session.expiresAt);
    } else {
      setIsAuthenticated(false);
      setAccessToken(null);
      setRefreshToken(null);
      setExpiresAt(null);
    }
  }, [session]);

  const handleSpotifyAuth = () => {
    if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
      throw new Error("Spotify configuration is missing. Please check your environment variables.");
    }

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      scope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPES,
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  };

  const handleCallback = async (code) => {
    try {
      const data = await exchangeSpotifyCode(code);

      updateSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      console.error("Failed to exchange Spotify code:", error);
      throw error;
    }
  };

  const logout = () => {
    updateSession(null);
  };

  const value = {
    isAuthenticated,
    accessToken,
    refreshToken,
    expiresAt,
    status,
    handleSpotifyAuth,
    handleCallback,
    logout,
  };

  return <SpotifyAuthContext.Provider value={value}>{children}</SpotifyAuthContext.Provider>;
};
