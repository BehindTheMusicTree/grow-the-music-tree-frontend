"use-client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSpotifyLibraryTracks } from "@/app/actions/spotify-library";

const SpotifyLibraryContext = createContext();

export const useSpotifyLibrary = () => {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
};

export const SpotifyLibraryProvider = ({ children }) => {
  const fetchLibraryTracks = useCallback(async () => {
    try {
      return await getSpotifyLibraryTracks();
    } catch (error) {
      throw new Error("Failed to fetch library tracks");
    }
  }, []);

  const {
    data: libraryTracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibraryTracks"],
    queryFn: fetchLibraryTracks,
  });

  const value = {
    libraryTracks,
    isLoading,
    error,
  };

  return <SpotifyLibraryContext.Provider value={value}>{children}</SpotifyLibraryContext.Provider>;
};
