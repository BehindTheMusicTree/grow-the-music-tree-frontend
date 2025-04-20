"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSpotifyLibTracks } from "@lib/music-tree-api-service/spotify-lib-track";
import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const {
    data: spotifyLibTracks,
    loading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: useAuthenticatedApi(listSpotifyLibTracks),
  });

  const value = {
    spotifyLibTracks,
    loading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
