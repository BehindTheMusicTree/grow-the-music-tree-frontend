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

export function useListGenres(page = 1, pageSize = process.env.NEXT_PUBLIC_GENRES_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["genres", "list", page],
    queryFn: async () => {
      const response = await fetch("genres/", true, true, {}, { page, pageSize });
      return PaginatedResponseSchema(CriteriaSimpleSchema).parse(response);
    },
  });
}

export function useFetchGenre() {
  const { fetch } = useFetchWrapper();

  return useCallback(
    async (id: string): Promise<CriteriaDetailed> => {
      const response = await fetch(`genres/${id}/`, true);
      return CriteriaDetailedSchema.parse(response);
    },
    [fetch],
  );
}

export function useLoadReferenceTreeGenre() {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  return useValidatedMutation({
    inputSchema: z.void(),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async () => {
      const response = await fetch("genres/tree/load-reference/", true, true, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useLoadPublicReferenceTreeGenre() {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();

  return useValidatedMutation({
    inputSchema: z.void(),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async () => {
      const response = await fetch("reference/genres/tree/load/", false, true, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referenceGenres"] });
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();
  const { fetch } = useFetchWrapper();

  return useValidatedMutation({
    inputSchema: CriteriaCreationSchema,
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async (data) => {
      const response = await fetch("genres/", true, true, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateAllGenrePlaylistQueries();
    },
  });
}

export function useUpdateGenre() {
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
      const response = await fetch(`genres/${uuid}/`, true, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
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

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const invalidateAllGenrePlaylistQueries = useInvalidateAllGenrePlaylistQueries();

  return useValidatedMutation({
    inputSchema: z.object({ uuid: z.string() }),
    outputSchema: CriteriaDetailedSchema,
    mutationFn: async ({ uuid }) => {
      const response = await fetch(`genres/${uuid}`, true, true, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
      invalidateAllGenrePlaylistQueries();
    },
  });
}
