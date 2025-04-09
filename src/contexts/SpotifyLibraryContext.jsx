import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { SpotifyLibTracksService } from "@utils/services";
import { useAuth } from "@contexts/AuthContext";

export const SpotifyLibraryContext = createContext();

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}

export function SpotifyLibraryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: tracks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: () => SpotifyLibTracksService.listSpotifyLibTracks(),
    enabled: isAuthenticated,
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ trackId, updates }) => SpotifyLibTracksService.updateTrack(trackId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });

  const deleteTrackMutation = useMutation({
    mutationFn: (trackId) => SpotifyLibTracksService.deleteTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });

  const updateTrack = async (trackId, updates) => {
    return updateTrackMutation.mutateAsync({ trackId, updates });
  };

  const deleteTrack = async (trackId) => {
    return deleteTrackMutation.mutateAsync(trackId);
  };

  return (
    <SpotifyLibraryContext.Provider
      value={{
        tracks,
        error,
        isLoading,
        updateTrack,
        deleteTrack,
        refreshTracks: () => queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] }),
      }}
    >
      {children}
    </SpotifyLibraryContext.Provider>
  );
}

SpotifyLibraryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
