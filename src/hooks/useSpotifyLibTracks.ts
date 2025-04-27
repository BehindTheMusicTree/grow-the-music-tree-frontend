"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedApi } from "@hooks/useAuthenticatedApi";
import { PaginatedResponse, PaginatedResponseSchema } from "@app-types/api/pagination";
import { SpotifyLibTrackDetailedSchema, SpotifyLibTrackDetailed } from "@schemas/spotify-lib-track";

export function useListSpotifyLibTracks(page = 1, pageSize = 20) {
  const listTracks = useAuthenticatedApi<PaginatedResponse<SpotifyLibTrackDetailed>>(async (authFetch) => {
    const response = await authFetch(`spotify/library/tracks?page=${page}&pageSize=${pageSize}`);
    return response.json();
  });

  return useQuery<PaginatedResponse<SpotifyLibTrackDetailed>>({
    queryKey: ["spotifyLibTracks", page, pageSize],
    queryFn: async () => {
      const response = await listTracks();
      if (!response.success) {
        throw new Error(response.error?.message);
      }
      return PaginatedResponseSchema(SpotifyLibTrackDetailedSchema).parse(response.data);
    },
  });
}

export function useQuickSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const quickSync = useAuthenticatedApi(async (authFetch) => {
    const response = await authFetch("library/spotify/sync/quick", { method: "POST" });
    return response.json();
  });

  return useMutation({
    mutationFn: async () => {
      const response = await quickSync();
      if (!response.success) {
        throw new Error(response.error?.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}

export function useFullSyncSpotifyLibTracks() {
  const queryClient = useQueryClient();
  const fullSync = useAuthenticatedApi(async (authFetch) => {
    const response = await authFetch("library/spotify/sync/full", { method: "POST" });
    return response.json();
  });

  return useMutation({
    mutationFn: async () => {
      const response = await fullSync();
      if (!response.success) {
        throw new Error(response.error?.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spotifyLibTracks"] });
    },
  });
}
