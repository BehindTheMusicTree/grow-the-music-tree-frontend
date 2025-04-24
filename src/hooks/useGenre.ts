import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "./useFetchWrapper";
import { GenreSchema, Genre } from "@/models/domain/genre";
import { GenreFormValues } from "@/schemas/genreFormSchema";

export function useListGenres(page = 1, pageSize = 50) {
  const { fetch } = useFetchWrapper();

  return useQuery<Genre[]>({
    queryKey: ["genres", "list", page, pageSize],
    queryFn: async () => {
      const response = await fetch("genre/", true);
      return GenreSchema.array().parse(response);
    },
  });
}

export function useRetrieveGenre(id: string) {
  const { fetch } = useFetchWrapper();

  return useQuery<Genre>({
    queryKey: ["genres", "detail", id],
    queryFn: async () => {
      const response = await fetch(`genre/${id}`, true);
      return GenreSchema.parse(response);
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation<Genre, Error, GenreFormValues>({
    mutationFn: async (data) => {
      const response = await fetch("genre/", true, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return GenreSchema.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  return useMutation<Genre, Error, { uuid: string; data: GenreFormValues }>({
    mutationFn: async ({ uuid, data }) => {
      const response = await fetch(`genre/${uuid}`, true, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return GenreSchema.parse(response);
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

  return useMutation<Genre, Error, { uuid: string }>({
    mutationFn: async ({ uuid }) => {
      const response = await fetch(`genre/${uuid}`, true, {
        method: "DELETE",
      });
      return GenreSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
    },
  });
}
