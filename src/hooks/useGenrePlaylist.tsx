"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import {
  GenrePlaylistDetailedSchema,
  GenrePlaylistDetailed,
  GenrePlaylistSimpleSchema,
} from "@schemas/domain/genre-playlist";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";

export const useListGenrePlaylists = (page = 1, pageSize = process.env.NEXT_PUBLIC_GENRE_PLAYLISTS_PAGE_SIZE || 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQuery({
    queryKey: ["genrePlaylists", page],
    queryFn: async () => {
      const response = await fetch("genre-playlists/", true, true, {}, { page, pageSize });
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

export const useRetrieveGenrePlaylist = (uuid: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<GenrePlaylistDetailed>({
    queryKey: ["genrePlaylists", uuid],
    queryFn: async () => {
      const response = await fetch(`genre-playlists/${uuid}`, true);
      return GenrePlaylistDetailedSchema.parse(response);
    },
  });
};
