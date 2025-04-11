import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

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
    const response = await fetch("/api/spotify-lib-tracks");
    if (!response.ok) {
      throw new Error("Failed to fetch library tracks");
    }
    return response.json();
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
