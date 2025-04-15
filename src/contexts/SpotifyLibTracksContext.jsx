"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSpotifyLibTracks } from "@actions/spotify-lib-tracks";
import { useError } from "@contexts/ErrorContext";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const { handleError } = useError();

  // Wrapper for server action that handles the new response format
  const fetchLibTracks = useCallback(async () => {
    const response = await listSpotifyLibTracks();
    return response.data;
  }, []);

  const {
    data: libTracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: fetchLibTracks,
    onError: handleError,
  });

  const value = {
    libTracks,
    isLoading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
