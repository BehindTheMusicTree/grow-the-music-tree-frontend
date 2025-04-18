"use client";

import { createContext, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { listGenrePlaylists as listGenrePlaylistsApi } from "@lib/api/genre-playlist-service";

const GenrePlaylistContext = createContext();

export function useGenrePlaylists() {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistProvider");
  }
  return context;
}

export function GenrePlaylistProvider({ children }) {
  const queryClient = useQueryClient();

  const listGenrePlaylists = useCallback(async () => {
    try {
      const response = await listGenrePlaylistsApi();
      return response;
    } catch (error) {
      console.error("Error fetching genre playlists:", error);
      throw error;
    }
  }, []);

  const {
    data: genrePlaylists = [],
    loading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: listGenrePlaylists,
    onError: error,
  });

  return (
    <GenrePlaylistContext.Provider
      value={{
        genrePlaylists,
        error,
        loading,
        refreshGenrePlaylists: () => queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] }),
      }}
    >
      {children}
    </GenrePlaylistContext.Provider>
  );
}

GenrePlaylistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
