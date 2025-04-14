"use-client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSpotifyLibTracks } from "@actions/spotify-lib-tracks";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  // Maximally simplified implementation - auth errors handled by GlobalAuthErrorHandler
  const fetchLibTracks = useCallback(async () => {
    // Direct call - errors will bubble up to GlobalAuthErrorHandler
    return listSpotifyLibTracks();
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
