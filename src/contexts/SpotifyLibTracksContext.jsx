"use client";

import { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";
import {
  listSpotifyLibTracks,
  quickSyncSpotifyLibTracks as quickSyncSpotifyLibTracksApi,
  fullSyncSpotifyLibTracks as fullSyncSpotifyLibTracksApi,
} from "@lib/music-tree-api-service/spotify-lib-track";
import { useSession } from "@contexts/SessionContext";

const SpotifyLibTracksContext = createContext();

export const useSpotifyLibTracks = () => {
  const context = useContext(SpotifyLibTracksContext);
  if (!context) {
    throw new Error("useSpotifyLibTracks must be used within a SpotifyLibTracksProvider");
  }
  return context;
};

export const SpotifyLibTracksProvider = ({ children }) => {
  const authenticatedListSpotifyLibTracks = useAuthenticatedApi(listSpotifyLibTracks);
  const { session, isLoading: isSessionLoading } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalTracks, setTotalTracks] = useState(0);

  const queryClient = useQueryClient();

  const {
    data: spotifyLibTracks,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["spotifyLibTracks", currentPage, pageSize],
    queryFn: async () => {
      const result = await authenticatedListSpotifyLibTracks(currentPage, pageSize);
      if (!result.success) {
        throw new Error(result.error.message);
      }

      setTotalTracks(result.data.total);
      return result.data.results;
    },
    enabled: !isSessionLoading && !!session,
  });

  const authenticatedQuickSyncSpotifyLibTracks = useAuthenticatedApi(quickSyncSpotifyLibTracksApi);
  const { mutate: quickSyncSpotifyLibTracks, isPending: isQuickSyncPending } = useMutation({
    mutationFn: async () => {
      const result = await authenticatedQuickSyncSpotifyLibTracks();
      console.log("Quick sync result:", result);
      if (!result.success) {
        console.error("Quick sync error:", result.error);
        throw new Error(result.error.message);
      }
      return result.data.results;
    },
  });

  const authenticatedFullSyncSpotifyLibTracks = useAuthenticatedApi(fullSyncSpotifyLibTracksApi);
  const { mutate: fullSyncSpotifyLibTracks, isPending: isFullSyncPending } = useMutation({
    mutationFn: async () => {
      const result = await authenticatedFullSyncSpotifyLibTracks();
      return result.data.results;
    },
  });

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const onPageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const refreshTracks = () => {
    queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
  };

  const value = {
    spotifyLibTracks,
    loading,
    error,
    quickSyncSpotifyLibTracks,
    isQuickSyncPending,
    fullSyncSpotifyLibTracks,
    isFullSyncPending,
    currentPage,
    pageSize,
    totalTracks,
    totalPages: Math.ceil(totalTracks / pageSize),
    onPageChange,
    onPageSizeChange,
    refreshTracks,
  };

  return <SpotifyLibTracksContext.Provider value={value}>{children}</SpotifyLibTracksContext.Provider>;
};
