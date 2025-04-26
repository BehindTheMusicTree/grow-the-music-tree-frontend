"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { PaginatedResponse, PaginatedResponseSchema } from "@app-types/api/pagination";
import {
  GenrePlaylistDetailedSchema,
  GenrePlaylistDetailed,
  GenrePlaylistSimpleSchema,
  GenrePlaylistSimple,
} from "@schemas/genre-playlist";

export const useListGenrePlaylists = (page = 1, pageSize = 50) => {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();

  const query = useQuery<PaginatedResponse<GenrePlaylistSimple>>({
    queryKey: ["genrePlaylists", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre-playlists", true, {}, { page, pageSize });
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
      const response = await fetch(`genre-playlists/${id}`);
      return GenrePlaylistDetailedSchema.parse(response);
    },
  });
};
