"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/contexts/SessionContext";
import { listGenrePlaylists } from "@/lib/music-tree-api-service/genre-playlist";
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi";

const GenrePlaylistContext = createContext();

export const useGenrePlaylists = () => {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistProvider");
  }
  return context;
};

export const GenrePlaylistProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const authenticatedApi = useAuthenticatedApi(listGenrePlaylists);
  const { session, isLoading: isSessionLoading } = useSession();

  const {
    data: genrePlaylists = [],
    loading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: async () => {
      const result = await authenticatedApi(1, 50);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data.results;
    },
    enabled: !isSessionLoading && !!session,
  });

  const value = {
    genrePlaylists,
    error,
    loading,
    refreshGenrePlaylists: () => queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] }),
  };

  return <GenrePlaylistContext.Provider value={value}>{children}</GenrePlaylistContext.Provider>;
};

GenrePlaylistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
