"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { PaginatedResponse, PaginatedResponseSchema } from "@app-types/api/pagination";
import { SpotifyLibTrackDetailedSchema, SpotifyLibTrackDetailed } from "@schemas/domain/spotify-lib-track";

export function useListSpotifyLibTracks(page = 1, pageSize = 20) {
  const { fetch } = useFetchWrapper();

  return useQuery<PaginatedResponse<SpotifyLibTrackDetailed>>({
    queryKey: ["spotifyLibTracks", page, pageSize],
    queryFn: async () => {
      const response = await fetch(`library/spotify?page=${page}&pageSize=${pageSize}`);
      console.log("spotifyLibTracks response", response);
      return PaginatedResponseSchema(SpotifyLibTrackDetailedSchema).parse(response);
    },
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
