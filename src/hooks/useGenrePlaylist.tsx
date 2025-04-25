"use client";

import { useQuery } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { PaginatedResponse, PaginatedResponseSchema } from "@types/api/pagination";
import {
  GenrePlaylistDetailedSchema,
  GenrePlaylistDetailed,
  GenrePlaylistSimpleSchema,
  GenrePlaylistSimple,
} from "@models/domain/genre-playlist";

export const useListGenrePlaylists = (page = 1, pageSize = 50) => {
  const { fetch } = useFetchWrapper();
  return useQuery<PaginatedResponse<GenrePlaylistSimple>>({
    queryKey: ["genrePlaylists", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre-playlists", true, {}, { page, pageSize });
      return PaginatedResponseSchema(GenrePlaylistSimpleSchema).parse(response);
    },
  });
};

export const useRetrieveGenrePlaylist = (id: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<GenrePlaylistDetailed>({
    queryKey: ["genrePlaylists", id],
    queryFn: async () => {
      const response = await fetch(`genre-playlists/${id}`);
      return GenrePlaylistDetailedSchema.parse(response);
    },
  });
};
