"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import {
  GenrePlaylistDetailedSchema,
  GenrePlaylistDetailed,
  GenrePlaylistSimpleSchema,
  GenrePlaylistSimple,
} from "@schemas/genre-playlist";
import { PaginatedResponse, PaginatedResponseSchema } from "@app-types/api/pagination";

export const useListGenrePlaylists = (page = 1, pageSize = 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const query = useQuery<PaginatedResponse<GenrePlaylistSimple>>({
    queryKey: ["genrePlaylists", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre-playlist/", true, {}, { page, pageSize });
      return PaginatedResponseSchema(GenrePlaylistSimpleSchema).parse(response);
    },
  });

  const invalidateGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
  };

  return {
    ...query,
    invalidateGenrePlaylists,
  };
};

export const useRetrieveGenrePlaylist = (id: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<GenrePlaylistDetailed>({
    queryKey: ["genrePlaylists", id],
    queryFn: async () => {
      const response = await fetch(`genre-playlist/${id}`, true);
      return GenrePlaylistDetailedSchema.parse(response);
    },
  });
};

export const useGenrePlaylist = (genre: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery({
    queryKey: ["genre-playlist", genre],
    queryFn: async () => {
      const response = await fetch(`genre-playlist/genre/${genre}`, true);
      return response;
    },
    enabled: !!genre,
  });
};
