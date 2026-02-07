import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useFetchWrapper } from "./useFetchWrapper";
import { useInvalidateAllGenrePlaylistQueries } from "@hooks/useGenrePlaylist";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { CriteriaDetailedSchema, CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";
import { CriteriaSimpleSchema } from "@schemas/domain/criteria/response/simple";
import { CriteriaCreationSchema } from "@schemas/domain/criteria/form/creation";
import { CriteriaUpdateSchema } from "@schemas/domain/criteria/form/update";
import { useValidatedMutation } from "./useValidatedMutation";
import { genreEndpoints, genreQueryKeys } from "../api/endpoints/genres.contract";

export function useListGenres(
  page = 1,
  pageSize = process.env.NEXT_PUBLIC_GENRES_PAGE_SIZE || 50,
  isReference = false,
) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: isReference ? genreQueryKeys.reference.list(page) : genreQueryKeys.me.list(page),
    queryFn: async () => {
      const endpoint = isReference ? genreEndpoints.reference.list() : genreEndpoints.me.list();
      const response = await fetch(endpoint, isReference, true, true, {}, { page, pageSize });
      return PaginatedResponseSchema(CriteriaSimpleSchema).parse(response);
    },
  });
}

export function useFetchGenre(isReference = false) {
  const { fetch } = useFetchWrapper();

  return useCallback(
    async (id: string): Promise<CriteriaDetailed> => {
      const endpoint = isReference ? genreEndpoints.reference.detail(id) : genreEndpoints.me.detail(id);
      const response = await fetch(endpoint, true);
      return CriteriaDetailedSchema.parse(response);
    },
    [fetch, isReference],
  );
}

export function useLoadReferenceTreeGenre(isReference = false) {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  return useValidatedMutation({
    inputSchema: z.void(),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async () => {
      const endpoint = isReference ? genreEndpoints.reference.loadTree() : genreEndpoints.me.loadTree();
      const response = await fetch(endpoint, isReference, true, true, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      const queryKey = isReference ? genreQueryKeys.reference.all : genreQueryKeys.me.all;
      queryClient.invalidateQueries({ queryKey });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useLoadPublicReferenceTreeGenre(isReference = false) {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();

  return useValidatedMutation({
    inputSchema: z.void(),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async () => {
      const endpoint = isReference ? genreEndpoints.reference.loadTree() : genreEndpoints.me.loadTree();
      const response = await fetch(endpoint, true, true, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      const queryKey = isReference ? genreQueryKeys.reference.all : genreQueryKeys.me.all;
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useCreateGenre(isReference = false) {
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();
  const { fetch } = useFetchWrapper();

  return useValidatedMutation({
    inputSchema: CriteriaCreationSchema,
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async (data) => {
      const endpoint = isReference ? genreEndpoints.reference.create() : genreEndpoints.me.create();
      const response = await fetch(endpoint, true, true, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      const queryKey = isReference ? genreQueryKeys.reference.all : genreQueryKeys.me.all;
      queryClient.invalidateQueries({ queryKey });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useUpdateGenre(isReference = false) {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  const { mutate, formErrors } = useValidatedMutation({
    inputSchema: z.object({
      uuid: z.string(),
      data: CriteriaUpdateSchema,
    }),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async ({ uuid, data }) => {
      const endpoint = isReference ? genreEndpoints.reference.update(uuid) : genreEndpoints.me.update(uuid);
      const response = await fetch(endpoint, true, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, { uuid }) => {
      const queryKey = isReference ? genreQueryKeys.reference.all : genreQueryKeys.me.all;
      const detailKey = isReference ? genreQueryKeys.reference.detail(uuid) : genreQueryKeys.me.detail(uuid);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: detailKey });
      invalidateAllGenrePlaylistQueries();
    },
  });

  const renameGenre = (uuid: string, name: string) => {
    mutate({ uuid, data: { name } });
  };

  const updateGenreParent = async (uuid: string, parentUuid: string) => {
    return new Promise<void>((resolve) => {
      mutate({ uuid, data: { parent: parentUuid } });
      resolve();
    });
  };

  return { mutate, renameGenre, updateGenreParent, formErrors };
}

export function useDeleteGenre(isReference = false) {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  return useValidatedMutation({
    inputSchema: z.object({ uuid: z.string() }),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async ({ uuid }) => {
      const endpoint = isReference ? genreEndpoints.reference.delete(uuid) : genreEndpoints.me.delete(uuid);
      const response = await fetch(endpoint, true, true, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: (_, { uuid }) => {
      const queryKey = isReference ? genreQueryKeys.reference.all : genreQueryKeys.me.all;
      const detailKey = isReference ? genreQueryKeys.reference.detail(uuid) : genreQueryKeys.me.detail(uuid);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: detailKey });
      invalidateAllGenrePlaylistQueries();
    },
  });
}
