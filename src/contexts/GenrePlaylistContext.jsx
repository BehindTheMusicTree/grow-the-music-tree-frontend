"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { status } = useSession();
  const {
    data: genrePlaylists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}genres-playlists`);
      if (!response.ok) {
        throw new Error("Failed to fetch genre playlists");
      }
      return response.json();
    },
    enabled: status === "authenticated",
  });

  const addGenreMutation = useMutation({
    mutationFn: async (genreData) => {
      const response = await fetch(`${baseUrl}genres-playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(genreData),
      });
      if (!response.ok) {
        throw new Error("Failed to add genre");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
    enabled: status === "authenticated",
  });

  const updateGenreMutation = useMutation({
    mutationFn: async ({ genreUuid, genreData }) => {
      const response = await fetch(`${baseUrl}genres-playlists/${genreUuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(genreData),
      });
      if (!response.ok) {
        throw new Error("Failed to update genre");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
    enabled: status === "authenticated",
  });

  const deleteGenreMutation = useMutation({
    mutationFn: async (genreUuid) => {
      const response = await fetch(`${baseUrl}genres-playlists/${genreUuid}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete genre");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
    enabled: status === "authenticated",
  });

  const addGenre = async (genreData) => {
    return addGenreMutation.mutateAsync(genreData);
  };

  const updateGenre = async (genreUuid, genreData) => {
    return updateGenreMutation.mutateAsync({ genreUuid, genreData });
  };

  const deleteGenre = async (genreUuid) => {
    return deleteGenreMutation.mutateAsync(genreUuid);
  };

  const retrieveGenre = (genreUuid) => {
    return genrePlaylists.find((genre) => genre.uuid === genreUuid);
  };

  const listGenrePlaylists = () => {
    return genrePlaylists;
  };

  return (
    <GenrePlaylistContext.Provider
      value={{
        genrePlaylists,
        error,
        isLoading,
        addGenre,
        updateGenre,
        deleteGenre,
        retrieveGenre,
        listGenrePlaylists,
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
