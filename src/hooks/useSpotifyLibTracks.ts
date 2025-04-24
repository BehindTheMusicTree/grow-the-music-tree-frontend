"use client";

import { useQuery } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { ErrorCode, getMessage } from "@/lib/connectivity-errors/codes";
import { ApiSpotifyLibTrackDto } from "@/types/dto/spotify";

interface SpotifyLibTracksResponse {
  items: ApiSpotifyLibTrackDto[];
}

export function useSpotifyLibTracks() {
  const fetchTracks = useFetchWrapper<SpotifyLibTracksResponse>(async (authFetch) => {
    const response = await authFetch("/api/spotify/library/tracks");
    const data = await response.json();
    return data;
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["spotifyLibTracks"],
    queryFn: async () => {
      const response = await fetchTracks();
      if (response.success && response.data) {
        return response.data.items;
      }
      throw new Error(response.error?.message || getMessage(ErrorCode.INTERNAL));
    },
  });

  return {
    tracks: data || [],
    isLoading,
    error: error?.message || null,
    loadTracks: refetch,
  };
}
