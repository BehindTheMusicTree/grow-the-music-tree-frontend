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

interface GenrePlaylist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  genre: string;
}

interface GenrePlaylistResponse {
  playlist: GenrePlaylist;
}

export function useGenrePlaylist() {
  const [playlist, setPlaylist] = useState<GenrePlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylist = useAuthenticatedApi<GenrePlaylistResponse>(async (authFetch, ...args) => {
    const genre = args[0] as string;
    return authFetch(`/api/playlists/genre/${genre}`);
  });

  const loadPlaylist = useCallback(
    async (genre: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchPlaylist(genre);
        if (response.success && response.data) {
          setPlaylist(response.data.playlist);
        } else {
          setError(response.error?.message || getMessage(ErrorCode.INTERNAL));
        }
      } catch (error) {
        setError(getMessage(ErrorCode.INTERNAL));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPlaylist]
  );

  const createPlaylist = useAuthenticatedApi<GenrePlaylistResponse>(async (authFetch, ...args) => {
    const genre = args[0] as string;
    return authFetch("/api/playlists/genre", {
      method: "POST",
      body: JSON.stringify({ genre }),
    });
  });

  const generatePlaylist = useCallback(
    async (genre: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await createPlaylist(genre);
        if (response.success && response.data) {
          setPlaylist(response.data.playlist);
        } else {
          setError(response.error?.message || getMessage(ErrorCode.INTERNAL));
        }
      } catch (error) {
        setError(getMessage(ErrorCode.INTERNAL));
      } finally {
        setIsLoading(false);
      }
    },
    [createPlaylist]
  );

  return {
    playlist,
    isLoading,
    error,
    loadPlaylist,
    generatePlaylist,
  };
}
