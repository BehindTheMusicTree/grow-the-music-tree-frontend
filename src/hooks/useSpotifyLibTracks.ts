"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { parseWithLog } from "@lib/parse-with-log";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { SpotifyLibTrackSimpleSchema } from "@domain/spotify/spotify-lib-track";
import { libraryEndpoints, libraryQueryKeys } from "../api/endpoints/library";

export function useListSpotifyLibTracks(pageSize = process.env.NEXT_PUBLIC_SPOTIFY_LIB_TRACKS_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useInfiniteQuery({
    queryKey: libraryQueryKeys.me.spotify.all,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(libraryEndpoints.me.spotify.list(), false, true, {}, { page: pageParam, pageSize });
      return parseWithLog(
        PaginatedResponseSchema(SpotifyLibTrackSimpleSchema),
        response,
        "useListSpotifyLibTracks",
      );
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
      const response = await fetch(libraryEndpoints.me.spotify.syncQuick(), false, true, { method: "POST" });
      console.log("quick sync response", response);
      return response;
    },
    onSuccess: () => {
      console.log("quick sync success, invalidating queries");
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.me.spotify.all });
    },
  });
}

export function useFullSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(libraryEndpoints.me.spotify.syncFull(), false, true, { method: "POST" });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: libraryQueryKeys.me.spotify.all });
    },
  });
}
