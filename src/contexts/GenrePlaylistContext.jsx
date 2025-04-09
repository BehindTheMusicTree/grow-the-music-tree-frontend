import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { GenreService } from "@utils/services";
import { useAuthenticatedDataRefreshSignal } from "@hooks/useAuthenticatedDataRefreshSignal";

export const GenrePlaylistContext = createContext();

export function useGenrePlaylists() {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistProvider");
  }
  return context;
}

export function GenrePlaylistProvider({ children }) {
  const LOADING_KEY = "genrePlaylists";
  const { triggerRefresh, setLoading, getLoading } = useAuthenticatedDataRefreshSignal();

  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [error, setError] = useState(null);

  const fetchGenrePlaylists = useCallback(async () => {
    if (getLoading(LOADING_KEY)) return;

    try {
      setLoading(LOADING_KEY, true);
      setError(null);
      const playlists = await GenreService.getGenrePlaylists();
      setGenrePlaylists(playlists);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  }, [getLoading, setLoading]);

  useEffect(() => {
    fetchGenrePlaylists();
  }, [fetchGenrePlaylists]);

  const addGenre = async (genreData) => {
    try {
      setError(null);
      const newGenre = await GenreService.postGenre(genreData);
      setGenrePlaylists((prev) => [...prev, newGenre]);
      triggerRefresh(LOADING_KEY);
      return newGenre;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateGenre = async (genreUuid, genreData) => {
    try {
      setError(null);
      const updatedGenre = await GenreService.putGenre(genreUuid, genreData);
      setGenrePlaylists((prev) => prev.map((genre) => (genre.uuid === genreUuid ? updatedGenre : genre)));
      triggerRefresh(LOADING_KEY);
      return updatedGenre;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteGenre = async (genreUuid) => {
    try {
      setError(null);
      await GenreService.deleteGenre(genreUuid);
      setGenrePlaylists((prev) => prev.filter((genre) => genre.uuid !== genreUuid));
      triggerRefresh(LOADING_KEY);
    } catch (error) {
      setError(error.message);
      throw error;
    }
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
        loading: getLoading(LOADING_KEY),
        addGenre,
        updateGenre,
        deleteGenre,
        getGenre,
        getGenrePlaylists,
        refreshGenrePlaylists: () => triggerRefresh(LOADING_KEY),
      }}
    >
      {children}
    </GenrePlaylistContext.Provider>
  );
}

GenrePlaylistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
