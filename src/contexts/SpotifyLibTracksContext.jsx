"use-client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpotifyLibTracks } from "@actions/spotify-lib-tracks";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const fetchLibTracks = useCallback(async () => {
    try {
      return await getSpotifyLibTracks();
    } catch (error) {
      throw new Error("Failed to fetch library tracks");
    }
  }, []);

  const {
    data: libTracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: fetchLibTracks,
  });

  const value = {
    libTracks,
    isLoading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
