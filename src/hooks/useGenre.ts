import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";

import { useFetchWrapper } from "./useFetchWrapper";
import { PaginatedResponseSchema } from "@schemas/PaginatedResponse";
import { GenreDetailedSchema, GenreDetailed, GenreSimpleSchema } from "@schemas/domain/genre/response";
import { GenreCreationValues, GenreUpdateValues } from "@schemas/domain/genre/form";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { GenreCreationSchema, GenreUpdateSchema } from "@schemas/domain/genre/form";

export function useListGenres(page = 1, pageSize = process.env.NEXT_PUBLIC_GENRES_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["genres", "list", page],
    queryFn: async () => {
      const response = await fetch("genre/", true, true, {}, { page, pageSize });
      return PaginatedResponseSchema(GenreSimpleSchema).parse(response);
    },
  });
}

export function useRetrieveGenre(id: string) {
  const { fetch } = useFetchWrapper();

  return useQuery<GenreDetailed>({
    queryKey: ["genres", "detail", id],
    queryFn: async () => {
      const response = await fetch(`genre/${id}`, true);
      return GenreDetailedSchema.parse(response);
    },
  });
}

function mapGenreFormToPayload<T extends { parentUuid?: string }>(formData: T) {
  const { parentUuid, ...rest } = formData;
  return {
    ...rest,
    parent: parentUuid,
  };
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();
  const { fetch } = useFetchWrapper();
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  const mutate = useMutation<GenreDetailed | null, Error, GenreCreationValues>({
    mutationFn: async (data: unknown) => {
      try {
        const validatedData = GenreCreationSchema.parse(data);
        const payload = mapGenreFormToPayload(validatedData);
        const response = await fetch("genres/", true, true, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        return GenreDetailedSchema.parse(response);
      } catch (error) {
        console.log("catch error", error);
        if (error instanceof ZodError) {
          const fieldErrors = error.errors.map((error) => ({
            field: error.path.join("."),
            message: error.message,
          }));
          setFormErrors(fieldErrors);
        }
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateGenrePlaylists();
    },
    onError: (error) => {
      console.error(error);
      setFormErrors([{ field: "genre", message: "An error occurred while creating the genre" }]);
    },
  });

  return { ...mutate, formErrors };
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();

  const mutate = useMutation<GenreDetailed, Error, { uuid: string; data: GenreUpdateValues }>({
    mutationFn: async ({ uuid, data }) => {
      const payload = mapGenreFormToPayload(data);
      const response = await fetch(`genres/${uuid}`, true, true, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return GenreDetailedSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
      invalidateGenrePlaylists();
    },
  });

  const renameGenre = (uuid: string, name: string) => {
    mutate.mutate({ uuid, data: { name } });
  };

  const updateGenreParent = (uuid: string, parentUuid: string) => {
    mutate.mutate({ uuid, data: { parentUuid: parentUuid } });
  };

  return { mutate, renameGenre, updateGenreParent };
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();
  return useMutation<GenreDetailed, Error, { uuid: string }>({
    mutationFn: async ({ uuid }) => {
      const response = await fetch(`genres/${uuid}`, true, true, {
        method: "DELETE",
      });
      return GenreDetailedSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
      invalidateGenrePlaylists();
    },
  });
}
