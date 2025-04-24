import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { PaginatedResponse, PaginatedResponseSchema } from "@/types/api/pagination";
import { GenreDetailedSchema, GenreDetailed } from "@/models/domain/genre";
import { GenreFormValues } from "@/schemas/genreFormSchema";
import { GenreSimpleSchema, GenreSimple } from "@/types/api/genre";

export function useListGenres(page = 1, pageSize = 50) {
  const { fetch } = useFetchWrapper();

  return useQuery<PaginatedResponse<GenreDetailed>>({
    queryKey: ["genres", "list", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre/", true, {}, { page, pageSize });
      return PaginatedResponseSchema(GenreDetailedSchema).parse(response);
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

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation<GenreDetailed, Error, GenreFormValues>({
    mutationFn: async (data) => {
      const response = await fetch("genre/", true, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return GenreDetailedSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation<GenreDetailed, Error, { uuid: string; data: GenreFormValues }>({
    mutationFn: async ({ uuid, data }) => {
      const response = await fetch(`genre/${uuid}`, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return GenreDetailedSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

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
    },
  });
}
