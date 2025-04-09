import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { GenrePlaylistService } from "@utils/services";
import { useAuth } from "@contexts/AuthContext";

export const GenrePlaylistContext = createContext();

export function useGenrePlaylists() {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistProvider");
  }
  return context;
}

export function GenrePlaylistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: genrePlaylists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["genrePlaylists"],
    queryFn: () => GenrePlaylistService.getGenrePlaylists(),
    enabled: isAuthenticated,
  });

  const addGenreMutation = useMutation({
    mutationFn: (genreData) => GenrePlaylistService.postGenre(genreData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
  });

  const updateGenreMutation = useMutation({
    mutationFn: ({ genreUuid, genreData }) => GenrePlaylistService.putGenre(genreUuid, genreData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
  });

  const deleteGenreMutation = useMutation({
    mutationFn: (genreUuid) => GenrePlaylistService.deleteGenre(genreUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
    },
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

  const getGenre = (genreUuid) => {
    return genrePlaylists.find((genre) => genre.uuid === genreUuid);
  };

  const getGenrePlaylists = () => {
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
        getGenre,
        getGenrePlaylists,
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
