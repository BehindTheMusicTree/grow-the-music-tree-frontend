"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { listSpotifyLibTracks as listSpotifyLibTracksApi } from "@lib/api-service-service/spotify-lib-track-service";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  // Wrapper for API call that handles error handling
  const listSpotifyLibTracks = useCallback(async () => {
    try {
      const response = await listSpotifyLibTracksApi();
      return response;
    } catch (error) {
      console.error("Error fetching Spotify tracks:", error);
      throw error;
    }
  }, []);

  const {
    data: spotifyLibTracks,
    loading: loading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: listSpotifyLibTracks,
    onError: error,
  });

  const value = {
    spotifyLibTracks,
    loading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
