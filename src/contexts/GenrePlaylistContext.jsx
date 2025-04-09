import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { GenreService } from "@utils/services";
import { useAuthenticatedDataRefreshSignal } from "@hooks/useAuthenticatedDataRefreshSignal";

export const GenrePlaylistContext = createContext();

export function useGenrePlaylists() {
  const context = useContext(GenrePlaylistContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistsProvider");
  }
  return context;
}

export function GenrePlaylistsProvider({ children }) {
  const LOADING_KEY = "genrePlaylists";
  const { triggerRefresh, setLoading, getLoading } = useAuthenticatedDataRefreshSignal();

  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [error, setError] = useState(null);

  const fetchGenrePlaylists = useCallback(async () => {
    setLoading(LOADING_KEY, true);
    setError(null);
    try {
      const playlists = await GenreService.getGenrePlaylists();
      setGenrePlaylists(playlists);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchGenrePlaylists();
  }, [fetchGenrePlaylists, triggerRefresh]);

  const loading = getLoading(LOADING_KEY);
  const setRefreshSignal = () => triggerRefresh(LOADING_KEY);

  return (
    <GenrePlaylistContext.Provider
      value={{
        genrePlaylists,
        error,
        loading,
        setRefreshSignal,
      }}
    >
      {children}
    </GenrePlaylistContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
