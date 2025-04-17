"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listSpotifyLibTracks } from "@actions/spotify-lib-tracks";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const { handleConnectivityError } = useConnectivityError();

  // Wrapper for server action that handles the new response format
  // with added resilience for undefined responses
  const fetchSpotifyLibTracks = useCallback(async () => {
    try {
      const spotifyLibTracks = await listSpotifyLibTracks();
      return spotifyLibTracks;
    } catch (error) {
      console.error("Error fetching Spotify tracks:", error);
      throw error;
    }
  }, []);

  const {
    data: spotifyLibTracks,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: fetchSpotifyLibTracks,
    onError: handleConnectivityError,
  });

  const value = {
    spotifyLibTracks,
    loading,
    error,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
