import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { GenrePlaylistService } from "../utils/services";
import useApiConnectivity from "../hooks/useApiConnectivity";
import useAuthState from "../hooks/useAuthState";
import { useAuthenticatedDataRefreshSignal } from "../hooks/useAuthenticatedDataRefreshSignal";
import { handleApiError } from "../utils/apiErrorHandler";
import { checkTokenAndShowAuthIfNeeded } from "../utils/authUtils";

export const GenrePlaylistsContext = createContext();

export function useGenrePlaylists() {
  const context = useContext(GenrePlaylistsContext);
  if (!context) {
    throw new Error("useGenrePlaylists must be used within a GenrePlaylistsProvider");
  }
  return context;
}

export function GenrePlaylistsProvider({ children }) {
  const { isAuthenticated } = useAuthState();
  const { checkApiConnectivity } = useApiConnectivity();
  const { triggerRefresh } = useAuthenticatedDataRefreshSignal();

  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGenrePlaylists = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      await checkApiConnectivity();
      await checkTokenAndShowAuthIfNeeded();

      const response = await fetch("/api/genre-playlists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGenrePlaylists(data);
    } catch (error) {
      setError(error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, checkApiConnectivity]);

  useEffect(() => {
    fetchGenrePlaylists();
  }, [fetchGenrePlaylists, triggerRefresh]);

  return (
    <GenrePlaylistsContext.Provider
      value={{
        genrePlaylists,
        error,
        loading,
        setRefreshSignal: triggerRefresh,
      }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
