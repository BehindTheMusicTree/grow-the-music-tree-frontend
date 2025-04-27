"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { PaginatedResponseSchema } from "@schemas/PaginatedResponse";
import { SpotifyLibTrackDetailedSchema } from "@schemas/domain/spotify-lib-track";

export function useListSpotifyLibTracks(pageSize = process.env.NEXT_PUBLIC_SPOTIFY_LIB_TRACKS_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useInfiniteQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`library/spotify`, true, true, {}, { page: pageParam, pageSize });
      console.log("spotify lib tracks response", response);
      const parsed = PaginatedResponseSchema(SpotifyLibTrackDetailedSchema).parse(response);
      return {
        ...parsed,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
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
      const response = await fetch("library/spotify/sync/quick/", true, true, { method: "POST" });
      console.log("quick sync response", response);
      return response;
    },
    onSuccess: () => {
      console.log("quick sync success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}

export function useFullSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("library/spotify/sync/full/", true, true, { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}
