"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { SpotifyLibTrackSimpleSchema } from "@domain/spotify/spotify-lib-track";
import { libraryEndpoints, SPOTIFY_TRACKS_KEY } from "../api/endpoints/library.contract";

export function useListSpotifyLibTracks(pageSize = process.env.NEXT_PUBLIC_SPOTIFY_LIB_TRACKS_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useInfiniteQuery({
    queryKey: [SPOTIFY_TRACKS_KEY],
    queryFn: async ({ pageParam = 1 }) => {
      console.log("fetching spotify lib tracks", pageParam, pageSize);
      const response = await fetch(libraryEndpoints.spotify.list(), true, true, {}, { page: pageParam, pageSize });
      console.log("spotify lib tracks response", response);
      const parseResult = PaginatedResponseSchema(SpotifyLibTrackSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      console.log("paginated", parseResult.data);
      return parseResult.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: true,
  });
}

export function useQuickSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(libraryEndpoints.spotify.syncQuick(), true, true, { method: "POST" });
      console.log("quick sync response", response);
      return response;
    },
    onSuccess: () => {
      console.log("quick sync success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: [SPOTIFY_TRACKS_KEY] });
    },
  });
}

export function useFullSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(libraryEndpoints.spotify.syncFull(), true, true, { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SPOTIFY_TRACKS_KEY] });
    },
  });
}
