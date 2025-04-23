"use client";

import { useState, useCallback } from "react";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { ErrorCode, getMessage } from "@/lib/connectivity-errors/codes";

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
}

interface SpotifyLibTracksResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
}

export function useSpotifyLibTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useAuthenticatedApi<SpotifyLibTracksResponse>(async (authFetch) => {
    return authFetch("/api/spotify/library/tracks");
  });

  const loadTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchTracks();
      if (response.success && response.data) {
        setTracks(response.data.items);
      } else {
        setError(response.error?.message || getMessage(ErrorCode.INTERNAL));
      }
    } catch (error) {
      setError(getMessage(ErrorCode.INTERNAL));
    } finally {
      setIsLoading(false);
    }
  }, [fetchTracks]);

  return {
    tracks,
    isLoading,
    error,
    loadTracks,
  };
}
