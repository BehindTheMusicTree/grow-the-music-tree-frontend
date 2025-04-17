"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { listGenrePlaylists } from "@actions/genre-playlists";
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
  const { status } = useSession();
  const {
    data: genrePlaylists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: async () => {
      const response = await listGenrePlaylists();
      if (!response.ok) {
        throw new Error("Failed to fetch genre playlists");
      }
      return response.json();
    },
    enabled: status === "authenticated",
  });

  return (
    <GenrePlaylistContext.Provider
      value={{
        genrePlaylists,
        error,
        isLoading,
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
