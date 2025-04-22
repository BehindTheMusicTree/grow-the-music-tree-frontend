"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";
import { listSpotifyLibTracks } from "@lib/music-tree-api-service/spotify-lib-track";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const authenticatedApi = useAuthenticatedApi(listSpotifyLibTracks);

  const {
    data: spotifyLibTracks,
    loading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: async () => {
      const result = await authenticatedApi(1, 50);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      console.log("spotifyLibTracks", result.data);
      return result.data.results;
    },
  });

  const value = {
    spotifyLibTracks,
    loading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
