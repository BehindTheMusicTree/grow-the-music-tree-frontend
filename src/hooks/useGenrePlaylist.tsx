"use client";

import { z } from "zod";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { parseWithLog } from "@lib/parse-with-log";
import { useQueryWithParse } from "@hooks/useQueryWithParse";

import { CriteriaPlaylistSimpleSchema } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaPlaylistDetailedSchema, CriteriaPlaylistDetailed } from "@domain/playlist/criteria-playlist/detailed";

import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { playlistEndpoints, playlistQueryKeys } from "../api/endpoints/playlists";
import { Scope } from "@app-types/Scope";

const FULL_LIST_PAGE_SIZE = 1000;

export const useListGenrePlaylists = (page = 1, pageSize = process.env.NEXT_PUBLIC_GENRE_PLAYLISTS_PAGE_SIZE || 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQueryWithParse({
    queryKey: playlistQueryKeys.me.list(page),
    queryFn: () => fetch(playlistEndpoints.me.list(), true, true, {}, { page, pageSize }),
    schema: PaginatedResponseSchema(CriteriaPlaylistSimpleSchema),
    context: "useListGenrePlaylists",
  });

  const invalidateGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: playlistQueryKeys.me.all });
  };

  return {
    ...query,
    invalidateGenrePlaylists,
  };
};

export const useListFullGenrePlaylists = (scope: Scope) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const queryKey = scope === "reference" ? playlistQueryKeys.reference.full : playlistQueryKeys.me.full;

  const query = useQueryWithParse({
    queryKey,
    queryFn: () =>
      fetch(
        scope === "reference" ? playlistEndpoints.reference.list() : playlistEndpoints.me.list(),
        true,
        scope === "me",
        {},
        { page: 1, pageSize: FULL_LIST_PAGE_SIZE },
      ),
    schema: PaginatedResponseSchema(CriteriaPlaylistSimpleSchema),
    context: "useListFullGenrePlaylists",
  });

  const invalidateFullGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...query,
    invalidateFullGenrePlaylists,
  };
};

export const useFetchGenrePlaylist = (uuid: string) => {
  const { fetch } = useFetchWrapper();
  return useQueryWithParse<CriteriaPlaylistDetailed>({
    queryKey: playlistQueryKeys.me.detail(uuid),
    queryFn: () => fetch(playlistEndpoints.me.detail(uuid)),
    schema: CriteriaPlaylistDetailedSchema as z.ZodType<CriteriaPlaylistDetailed>,
    context: "useFetchGenrePlaylist",
  });
};

export const useFetchGenrePlaylistDetailed = (scope: Scope) => {
  const { fetch } = useFetchWrapper();

  return useMutation<CriteriaPlaylistDetailed, Error, string>({
    mutationFn: async (uuid: string) => {
      const endpoint =
        scope === "reference" ? playlistEndpoints.reference.detail(uuid) : playlistEndpoints.me.detail(uuid);
      const response = await fetch(endpoint, true, scope === "me");
      return parseWithLog(
        CriteriaPlaylistDetailedSchema,
        response,
        "useFetchGenrePlaylistDetailed",
      ) as CriteriaPlaylistDetailed;
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
