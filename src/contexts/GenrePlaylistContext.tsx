"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import {
  listGenrePlaylists,
  type GenrePlaylist,
  type PaginatedResponse,
} from "@/lib/music-tree-api-service/genre-playlist";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";

interface GenrePlaylistContextType {
  genrePlaylists: GenrePlaylist[];
  error: Error | null;
  loading: boolean;
  refreshGenrePlaylists: () => void;
}

const GenrePlaylistContext = createContext<GenrePlaylistContextType | null>(null);

export const useGenrePlaylists = () => {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistProvider");
  }
  return context;
};

interface GenrePlaylistProviderProps {
  children: ReactNode;
}

export const GenrePlaylistProvider = ({ children }: GenrePlaylistProviderProps) => {
  const queryClient = useQueryClient();
  const authenticatedApi = useAuthenticatedApi<PaginatedResponse<GenrePlaylist>, [number, number]>(listGenrePlaylists);
  const { session } = useSession();

  const {
    data: genrePlaylists = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: async () => {
      const result = await authenticatedApi(1, 50);
      if (!result.success) {
        throw new Error(result.error?.message);
      }
      return result.data?.results || [];
    },
    enabled: !!session,
  });

  const value: GenrePlaylistContextType = {
    genrePlaylists,
    error,
    loading,
    refreshGenrePlaylists: () => queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] }),
  };

  return <GenrePlaylistContext.Provider value={value}>{children}</GenrePlaylistContext.Provider>;
};
