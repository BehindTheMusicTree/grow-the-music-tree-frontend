"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";

import { CriteriaPlaylistSimpleSchema } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaPlaylistDetailedSchema, CriteriaPlaylistDetailed } from "@domain/playlist/criteria-playlist/detailed";

import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { playlistEndpoints, playlistQueryKeys } from "../api/endpoints/playlists.contract";

const FULL_LIST_PAGE_SIZE = 1000;

export const useListGenrePlaylists = (page = 1, pageSize = process.env.NEXT_PUBLIC_GENRE_PLAYLISTS_PAGE_SIZE || 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQuery({
    queryKey: playlistQueryKeys.me.list(page),
    queryFn: async () => {
      const response = await fetch(playlistEndpoints.me.list(), true, true, {}, { page, pageSize });
      const parseResult = PaginatedResponseSchema(CriteriaPlaylistSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      return parseResult.data;
    },
  });

  const invalidateGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.me.all });
  };

  return {
    ...query,
    invalidateGenrePlaylists,
  };
};

export const useListFullGenrePlaylists = (isReference = false) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const queryKey = isReference ? playlistQueryKeys.reference.full : playlistQueryKeys.me.full;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        isReference ? playlistEndpoints.reference.list() : playlistEndpoints.me.list(),
        true,
        !isReference,
        {},
        { page: 1, pageSize: FULL_LIST_PAGE_SIZE },
      );
      const parseResult = PaginatedResponseSchema(CriteriaPlaylistSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      return parseResult.data;
    },
  });

  const invalidateFullGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...query,
    invalidateFullGenrePlaylists,
  };
};

export const useRetrieveGenrePlaylist = (uuid: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<CriteriaPlaylistDetailed>({
    queryKey: playlistQueryKeys.me.detail(uuid),
    queryFn: async () => {
      const response = await fetch(playlistEndpoints.me.detail(uuid), true, true);
      return CriteriaPlaylistDetailedSchema.parse(response);
    },
  });
};

export const useFetchGenrePlaylistDetailed = () => {
  const { fetch } = useFetchWrapper();

  return useMutation<CriteriaPlaylistDetailed, Error, string>({
    mutationFn: async (uuid: string) => {
      const response = await fetch(playlistEndpoints.me.detail(uuid), true, true);
      return CriteriaPlaylistDetailedSchema.parse(response);
    },
  });
};

export const useInvalidateAllGenrePlaylistQueries = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.me.all });
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.me.full });
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.reference.all });
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.reference.full });
  };
};
