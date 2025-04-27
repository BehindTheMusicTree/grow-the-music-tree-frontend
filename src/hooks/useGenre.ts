import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { PaginatedResponse, PaginatedResponseSchema } from "@app-types/api/pagination";
import { GenreDetailedSchema, GenreDetailed, GenreSimpleSchema, GenreSimple } from "@schemas/genre/response";
import { GenreCreationValues, GenreUpdateValues } from "@schemas/genre/form";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";

export function useListGenres(page = 1, pageSize = 50) {
  const { fetch } = useFetchWrapper();

  return useQuery<PaginatedResponse<GenreSimple>>({
    queryKey: ["genres", "list", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre/", true, {}, { page, pageSize });
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

  return useMutation<GenreDetailed, Error, GenreCreationValues>({
    mutationFn: async (data: GenreCreationValues) => {
      const payload = mapGenreFormToPayload(data);
      const response = await fetch("genre/", true, true, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return GenreDetailedSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateGenrePlaylists();
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();

  const mutate = useMutation<GenreDetailed, Error, { uuid: string; data: GenreUpdateValues }>({
    mutationFn: async ({ uuid, data }) => {
      const payload = mapGenreFormToPayload(data);
      const response = await fetch(`genre/${uuid}`, true, true, {
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
      const response = await fetch(`genre/${uuid}`, true, {
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
