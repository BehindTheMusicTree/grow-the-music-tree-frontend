import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { GenreService } from "../../utils/services";
import { useAuthenticatedDataRefreshSignal } from "../../hooks/useAuthenticatedDataRefreshSignal";
import useApiConnectivity from "../../hooks/useApiConnectivity";
import useAuthChangeHandler from "../../hooks/useAuthChangeHandler";
import useAuthState from "../../hooks/useAuthState";
import useSpotifyAuthActions from "../../hooks/useSpotifyAuthActions";
import ApiTokenService from "../../utils/services/ApiTokenService";
import BadRequestError from "@utils/errors/BadRequestError";

export const GenrePlaylistsContext = createContext();

export function GenrePlaylistsProvider({ children }) {
  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { refreshSignal, setRefreshSignal, isOperationInProgressRef } = useAuthenticatedDataRefreshSignal();
  const isAuthenticated = useAuthState();
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: setRefreshSignal,
    fetchingRef: isOperationInProgressRef,
    refreshInProgressRef: isOperationInProgressRef,
  });

  // Setup authentication handling and event listeners
  const { registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback: setRefreshSignal,
    isFetchingRef: isOperationInProgressRef,
    refreshInProgressRef: isOperationInProgressRef,
  });

  // Setup auth event listeners and perform initial auth check
  useEffect(() => {
    const unregisterListeners = registerListeners();
    checkAuthAndRefresh();
    return unregisterListeners;
  }, [registerListeners, checkAuthAndRefresh]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      setRefreshSignal();
    }
  }, [isAuthenticated, setRefreshSignal]);

  useEffect(() => {
    const fetchGenrePlaylists = async () => {
      if (refreshSignal > 0 && !isOperationInProgressRef.current) {
        isOperationInProgressRef.current = true;
        setLoading(true);
        setError(null);

        try {
          const directTokenCheck = ApiTokenService.hasValidApiToken();
          if (!directTokenCheck) {
            setError("Authentication required");
            checkTokenAndShowAuthIfNeeded(true);
            return;
          }

          const playlists = await GenreService.getGenrePlaylists();
          setGenrePlaylists(playlists);
          setError(null);
        } catch (error) {
          console.error("Error fetching genre playlists:", error);
          const isConnectivityError = handleApiError(error, "/api/genres/playlists");
          if (!isConnectivityError) {
            setError("Failed to load genre playlists");
          }
        } finally {
          setLoading(false);
          isOperationInProgressRef.current = false;
        }
      }
    };

    fetchGenrePlaylists();
  }, [refreshSignal, checkTokenAndShowAuthIfNeeded, handleApiError]);

  const addGenre = async (name, parentUuid) => {
    try {
      await GenreService.postGenre({
        name,
        parent: parentUuid,
      });
      setRefreshSignal();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const getGenrePlaylistsGroupedByRoot = (genrePlaylists) => {
    const groupedGenrePlaylists = {};
    genrePlaylists.forEach((genrePlaylist) => {
      const rootUuid = genrePlaylist.root.uuid;
      if (!groupedGenrePlaylists[rootUuid]) {
        groupedGenrePlaylists[rootUuid] = [];
      }
      groupedGenrePlaylists[rootUuid].push(genrePlaylist);
    });

    return groupedGenrePlaylists;
  };

  const updateGenreParent = async (genreUuid, parentUuid) => {
    try {
      await GenreService.putGenre(genreUuid, {
        parent: parentUuid,
      });
      setRefreshSignal();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const renameGenre = async (genreUuid, newName) => {
    try {
      await GenreService.putGenre(
        genreUuid,
        {
          name: newName,
        },
        true
      );
      setRefreshSignal();
      return { success: true };
    } catch (error) {
      if (error instanceof BadRequestError) {
        return {
          success: false,
          error,
          isBadRequest: true,
          errorDetails: error.details,
        };
      }
      return { success: false, error };
    }
  };

  const deleteGenre = async (genreUuid) => {
    try {
      await GenreService.deleteGenre(genreUuid);
      setRefreshSignal();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return (
    <GenrePlaylistsContext.Provider
      value={{
        genrePlaylists,
        addGenre,
        setRefreshGenrePlaylistsSignal: setRefreshSignal,
        updateGenreParent,
        renameGenre,
        deleteGenre,
        error,
        loading,
      }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
