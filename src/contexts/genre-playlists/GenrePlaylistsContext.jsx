import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import GenreService from "@utils/services/GenreService";
import BadRequestError from "@utils/errors/BadRequestError";
import useAuthState from "@hooks/useAuthState";

export const GenrePlaylistsContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <GenrePlaylistsProviderInner location={location}>{children}</GenrePlaylistsProviderInner>;
}

// Inner provider that takes location as a prop
function GenrePlaylistsProviderInner({ children }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignalRaw] = useState(0); // Start with 0 to prevent automatic fetch on mount
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuthState();

  const isOperationInProgressRef = useRef(false);
  const previousAuthStateRef = useRef(false);

  // Create safe version of refresh function
  const triggerRefresh = useCallback(() => {
    if (!isOperationInProgressRef.current) {
      isOperationInProgressRef.current = true;
      setRefreshGenrePlaylistsSignalRaw((prev) => prev + 1);
      setTimeout(() => {
        isOperationInProgressRef.current = false;
      }, 100);
    }
  }, []);

  const fetchGenrePlaylists = useCallback(async () => {
    isOperationInProgressRef.current = true;
    setError(null);

    try {
      const genrePlaylists = await GenreService.getGenrePlaylists();

      if (genrePlaylists && genrePlaylists.length > 0) {
        const grouped = getGenrePlaylistsGroupedByRoot(genrePlaylists);
        setGroupedGenrePlaylists(grouped);
      } else {
        setGroupedGenrePlaylists({});
      }
    } catch (error) {
      setError(error);
      setGroupedGenrePlaylists({});
    } finally {
      isOperationInProgressRef.current = false;
      setRefreshGenrePlaylistsSignalRaw(0);
    }
  }, []);

  useEffect(() => {
    if (
      !isOperationInProgressRef.current &&
      isAuthenticated &&
      (!previousAuthStateRef.current || refreshGenrePlaylistsSignal)
    ) {
      fetchGenrePlaylists();
    }
  }, [isAuthenticated, fetchGenrePlaylists, refreshGenrePlaylistsSignal]);

  const handleGenreAddAction = async (event, parentUuid) => {
    event.stopPropagation();

    const name = prompt("New genre name:");
    if (!name) {
      return { success: false, error: new Error("No name provided") };
    }

    try {
      await GenreService.postGenre({
        name: name,
        parent: parentUuid,
      });
      triggerRefresh();
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
      triggerRefresh();
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
      triggerRefresh();
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
      triggerRefresh();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return (
    <GenrePlaylistsContext.Provider
      value={{
        groupedGenrePlaylists,
        handleGenreAddAction,
        setRefreshGenrePlaylistsSignal: triggerRefresh,
        updateGenreParent,
        renameGenre,
        deleteGenre,
        error,
      }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

// Main provider component that handles both Router and non-Router contexts
function GenrePlaylistsProvider({ children }) {
  try {
    // Try to render with location context
    return <LocationAwareProvider>{children}</LocationAwareProvider>;
  } catch (_) {
    // If we're outside Router context, render without location
    return <GenrePlaylistsProviderInner location={null}>{children}</GenrePlaylistsProviderInner>;
  }
}

GenrePlaylistsProviderInner.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

LocationAwareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { GenrePlaylistsProvider };
export default GenrePlaylistsProvider;
