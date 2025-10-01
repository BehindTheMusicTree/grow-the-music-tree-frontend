"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";

import { CriteriaPlaylistSimpleSchema } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaPlaylistDetailedSchema, CriteriaPlaylistDetailed } from "@domain/playlist/criteria-playlist/detailed";

import { PaginatedResponseSchema } from "@schemas/api/paginated-response";

export const useListGenrePlaylists = (page = 1, pageSize = process.env.NEXT_PUBLIC_GENRE_PLAYLISTS_PAGE_SIZE || 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQuery({
    queryKey: ["genrePlaylists", page],
    queryFn: async () => {
      const response = await fetch("genre-playlists/", true, true, {}, { page, pageSize });
      const parseResult = PaginatedResponseSchema(CriteriaPlaylistSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      return parseResult.data;
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

export const useListFullGenrePlaylists = () => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQuery({
    queryKey: ["fullGenrePlaylists"],
    queryFn: async () => {
      const response = await fetch("genre-playlists/", true, true, {}, { page: 1, pageSize: 1000 });
      const parseResult = PaginatedResponseSchema(CriteriaPlaylistSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      return parseResult.data;
    },
  });

  const invalidatefullGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: ["fullGenrePlaylists"] });
  };

  return {
    ...query,
    invalidatefullGenrePlaylists,
  };
};

export const useRetrieveGenrePlaylist = (uuid: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<CriteriaPlaylistDetailed>({
    queryKey: ["genrePlaylists", uuid],
    queryFn: async () => {
      const response = await fetch(`genre-playlists/${uuid}`, true);
      return CriteriaPlaylistDetailedSchema.parse(response);
    },
  });
};

export const useFetchGenrePlaylistDetailed = () => {
  const { fetch } = useFetchWrapper();

  return useMutation<CriteriaPlaylistDetailed, Error, string>({
    mutationFn: async (uuid: string) => {
      const response = await fetch(`genre-playlists/${uuid}`, true);
      return CriteriaPlaylistDetailedSchema.parse(response);
    },
  });
};

export const useInvalidateAllGenrePlaylistQueries = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    queryClient.invalidateQueries({ queryKey: ["fullGenrePlaylists"] });
  };
};
