"use client";

import { AuthFetch } from "@/hooks/useAuthenticatedApi";

export interface GenrePlaylist {
  id: string;
  name: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ListGenrePlaylistsFn = (
  authFetch: AuthFetch,
  page?: number,
  pageSize?: number
) => Promise<PaginatedResponse<GenrePlaylist>>;

export const listGenrePlaylists: ListGenrePlaylistsFn = async (authFetch, page = 1, pageSize = 50) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`genre-playlists?${params.toString()}`);
  return response.json();
};
