"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { PaginatedResponseSchema, PaginatedResponse } from "@schemas/PaginatedResponse";
import { SpotifyLibTrackDetailedSchema, SpotifyLibTrackDetailed } from "@schemas/domain/spotify-lib-track";

export function useListSpotifyLibTracks(pageSize = 20) {
  const { fetch } = useFetchWrapper();

  return useInfiniteQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`library/spotify?page=${pageParam}&pageSize=${pageSize}`);
      return PaginatedResponseSchema(SpotifyLibTrackDetailedSchema).parse(response);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useQuickSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("library/spotify/sync/quick", true, true, { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}

export function useFullSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("library/spotify/sync/full", true, true, { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}
