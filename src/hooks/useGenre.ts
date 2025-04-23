import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedApi, AuthFetch } from "./useAuthenticatedApi";
import { GenreService } from "@/services/api/genre";
import { Genre, GenreWithRelations } from "@/models/interfaces/genre";

const genreService = (authFetch: AuthFetch) => new GenreService(authFetch);

export function useListGenres(page = 1, pageSize = 50) {
  const listGenres = useAuthenticatedApi<Genre[], [number, number]>((authFetch, page, pageSize) =>
    genreService(authFetch).listGenres(page, pageSize)
  );

  return useQuery<Genre[]>({
    queryKey: ["genres", "list", page, pageSize],
    queryFn: async () => {
      const response = await listGenres(page, pageSize);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch genres");
      }
      return response.data;
    },
  });
}

export function useRetrieveGenre(id: string) {
  const getGenre = useAuthenticatedApi<GenreWithRelations, [string]>((authFetch, id) =>
    genreService(authFetch).getGenre(id)
  );

  return useQuery<GenreWithRelations>({
    queryKey: ["genres", "detail", id],
    queryFn: async () => {
      const response = await getGenre(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch genre");
      }
      return response.data;
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const createGenre = useAuthenticatedApi<Genre, [{ name: string; description?: string; parentId?: string }]>(
    (authFetch, data) => genreService(authFetch).createGenre(data)
  );

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; parentId?: string }) => {
      const response = await createGenre(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to create genre");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const updateGenre = useAuthenticatedApi<Genre, [string, { name?: string; description?: string; parentId?: string }]>(
    (authFetch, id, data) => genreService(authFetch).updateGenre(id, data)
  );

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; description?: string; parentId?: string };
    }) => {
      const response = await updateGenre(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to update genre");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", id] });
    },
  });
}
