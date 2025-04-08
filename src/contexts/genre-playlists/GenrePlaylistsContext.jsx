import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import GenreService from "@utils/services/GenreService";
import BadRequestError from "@utils/errors/BadRequestError";
import InvalidInputContentObject from "@models/popup-content-object/InvalidInputContentObject";
import useApiConnectivity from "@hooks/useApiConnectivity";
import useAuthErrorHandler from "@hooks/useAuthErrorHandler";

export const GenrePlaylistsContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <GenrePlaylistsProviderInner location={location}>{children}</GenrePlaylistsProviderInner>;
}

// Inner provider that takes location as a prop
function GenrePlaylistsProviderInner({ children, location }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignalRaw] = useState(0); // Start with 0 to prevent automatic fetch on mount
  const [error, setError] = useState(null);

  // Centralized auth error handling - provides both auth checking and error handling
  const { handleAuthError, checkTokenAndShowAuthIfNeeded } = useAuthErrorHandler(setError);

  // Declare all refs at the top of the component
  const isOperationInProgressRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const lastRefreshTimeRef = useRef(0);

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

  // Setup API connectivity handling with enhanced auth functionality
  const { isAuthenticated } = useApiConnectivity({
    refreshCallback: triggerRefresh,
    fetchingRef: isOperationInProgressRef,
  });

  // Track previous auth state
  const prevAuthStateRef = useRef(isAuthenticated);

  // Define fetchGenrePlaylists before any effects that use it
  const fetchGenrePlaylists = useCallback(async () => {
    console.log("[GenrePlaylistsContext] Starting fetchGenrePlaylists");

    try {
      isOperationInProgressRef.current = true;

      const genrePlaylists = await GenreService.getGenrePlaylists();

      if (genrePlaylists && genrePlaylists.length > 0) {
        const grouped = getGenrePlaylistsGroupedByRoot(genrePlaylists);
        setGroupedGenrePlaylists(grouped);
        setError(null);
      } else {
        setGroupedGenrePlaylists({});
      }
    } catch (error) {
      console.error("[GenrePlaylistsContext] Error fetching playlists:", error);

      // Use centralized error handling
      handleAuthError(error, "Failed to load genre playlists");
    } finally {
      console.log("[GenrePlaylistsContext] Resetting fetching flag");
      isOperationInProgressRef.current = false;
      setRefreshGenrePlaylistsSignalRaw(0);
    }
  }, [checkTokenAndShowAuthIfNeeded]);

  // React to changes in authentication state from the AuthContext
  useEffect(() => {
    // Update the reference to track changes
    prevAuthStateRef.current = isAuthenticated;

    // If user becomes authenticated, trigger a data refresh
    if (isAuthenticated && !isOperationInProgressRef.current) {
      triggerRefresh();
    }
  }, [isAuthenticated, triggerRefresh]);

  // Effect to handle route changes or navigation state with guards against concurrent updates
  useEffect(() => {
    // Throttle frequent checks
    const now = Date.now();
    if (now - lastAuthCheckRef.current < 1000) {
      return;
    }
    lastAuthCheckRef.current = now;

    // Check if we have location state with authCompleted flag (from React Router)
    if (location?.state?.authCompleted && !isOperationInProgressRef.current) {
      // If authentication was just completed, trigger a refresh
      isOperationInProgressRef.current = true;
      setRefreshGenrePlaylistsSignalRaw((prev) => prev + 1);
      // Reset the flag after a delay to allow state to settle
      setTimeout(() => {
        isOperationInProgressRef.current = false;
      }, 100);
    }
  }, [location]);

  // Effect to handle playlist refresh with better debounce and protection against loops
  useEffect(() => {
    let isMounted = true;

    const handleRefresh = async () => {
      const now = Date.now();
      // Debounce refresh calls - only allow one refresh per second
      if (now - lastRefreshTimeRef.current < 1000) {
        return;
      }

      // Only fetch if the signal is positive, component is mounted, and not already fetching
      if (refreshGenrePlaylistsSignal > 0 && isMounted && !isOperationInProgressRef.current) {
        lastRefreshTimeRef.current = now;
        await fetchGenrePlaylists();
      }
    };

    handleRefresh();

    return () => {
      isMounted = false;
    };
  }, [refreshGenrePlaylistsSignal, fetchGenrePlaylists]);

  const handleGenreAddAction = async (event, parentUuid) => {
    event.stopPropagation();

    // Check for valid Spotify token before API call
    if (!checkTokenAndShowAuthIfNeeded(true)) {
      return false;
    }

    const name = prompt("New genre name:");
    if (!name) {
      return false;
    }

    try {
      // GenreService handles connectivity errors and auth checks
      await GenreService.postGenre({
        name: name,
        parent: parentUuid,
      });
      triggerRefresh();
      return true;
    } catch (error) {
      // Use centralized error handling
      handleAuthError(error, "Failed to add genre");
      return false;
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
      // GenreService handles connectivity errors
      await GenreService.putGenre(genreUuid, {
        parent: parentUuid,
      });
      triggerRefresh();
    } catch (error) {
      // Use centralized error handling
      handleAuthError(error, "Failed to update genre");
      throw error;
    }
  };

  const renameGenre = async (genreUuid, newName, showPopupCallback) => {
    try {
      // Pass badRequestCatched=true to handle BadRequestError here instead of global handler
      await GenreService.putGenre(
        genreUuid,
        {
          name: newName,
        },
        true
      );
      triggerRefresh();
      return true;
    } catch (error) {
      if (error instanceof BadRequestError) {
        // Use the error directly from API, which already contains field error details
        const popupContentObject = new InvalidInputContentObject(error);

        // Use callback to show popup from the component
        if (showPopupCallback) {
          showPopupCallback(popupContentObject);
        }
        return false;
      }

      // Use centralized error handling for auth and other errors
      handleAuthError(error, "Failed to rename genre");
      return false;
    }
  };

  const deleteGenre = async (genreUuid) => {
    try {
      // GenreService handles connectivity errors
      await GenreService.deleteGenre(genreUuid);
      triggerRefresh();
    } catch (error) {
      // Use centralized error handling
      handleAuthError(error, "Failed to delete genre");
      throw error;
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
