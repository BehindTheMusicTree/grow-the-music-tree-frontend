import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import GenreService from "../../utils/services/GenreService";
import BadRequestError from "../../utils/errors/BadRequestError";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";
import InvalidInputContentObject from "../../models/popup-content-object/InvalidInputContentObject";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import SpotifyTokenService from "../../utils/services/SpotifyService";

export const GenrePlaylistsContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <GenrePlaylistsProviderInner location={location}>{children}</GenrePlaylistsProviderInner>;
}

// Inner provider that takes location as a prop
function GenrePlaylistsProviderInner({ children, location }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal] = useState(0); // Start with 0 to prevent automatic fetch on mount
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  // Track Spotify auth state directly
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyTokenService.hasValidSpotifyToken();
  });

  // Declare all refs at the top of the component
  const areGenrePlaylistsFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const tokenCheckIntervalRef = useRef(null);
  const lastRefreshTimeRef = useRef(0);
  const prevAuthStateRef = useRef(isAuthenticated);
  const refreshInProgressRef = useRef(false);

  // Define fetchGenrePlaylists before any effects that use it
  const fetchGenrePlaylists = useCallback(async () => {
    // Check token directly to ensure we have the latest state
    const directTokenCheck = SpotifyTokenService.hasValidSpotifyToken();

    try {
      if (!directTokenCheck) {
        setError("Authentication required");
        areGenrePlaylistsFetchingRef.current = false;
        setRefreshGenrePlaylistsSignal(0);
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

      areGenrePlaylistsFetchingRef.current = true;

      const genrePlaylists = await GenreService.getGenrePlaylists();

      if (genrePlaylists && genrePlaylists.length > 0) {
        const grouped = getGenrePlaylistsGroupedByRoot(genrePlaylists);
        setGroupedGenrePlaylists(grouped);
        setError(null);
      } else {
        setGroupedGenrePlaylists({});
      }
    } catch (error) {
      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
        setIsAuthenticated(false);
      } else {
        setError(`Failed to load genre playlists: ${error.message || "Unknown error"}`);
      }
    } finally {
      areGenrePlaylistsFetchingRef.current = false;
      setRefreshGenrePlaylistsSignal(0);
    }
  }, [checkTokenAndShowAuthIfNeeded]); // Removed unnecessary refreshGenrePlaylistsSignal dependency

  // Define updateAuthState and checkAuthFlag with useCallback to avoid recreating them on each render
  const updateAuthState = useCallback(async () => {
    const currentAuthState = SpotifyTokenService.hasValidSpotifyToken();
    if (currentAuthState !== prevAuthStateRef.current) {
      prevAuthStateRef.current = currentAuthState;
      setIsAuthenticated(currentAuthState);
    }
    return currentAuthState;
  }, []);

  const checkAuthFlag = useCallback(() => {
    const authCompleted = localStorage.getItem("spotify_auth_completed");

    if (authCompleted) {
      // Remove it immediately to prevent duplicate processing
      localStorage.removeItem("spotify_auth_completed");

      // Small delay to ensure token is available and stable
      setTimeout(() => {
        // Only trigger refresh if not already fetching and not in a refresh cycle
        if (
          SpotifyTokenService.hasValidSpotifyToken() &&
          !areGenrePlaylistsFetchingRef.current &&
          !refreshInProgressRef.current
        ) {
          refreshInProgressRef.current = true;
          setRefreshGenrePlaylistsSignal((prev) => prev + 1);
          // Reset the flag after a delay to allow state to settle
          setTimeout(() => {
            refreshInProgressRef.current = false;
          }, 100);
        }
      }, 500);

      return true;
    }
    return false;
  }, []);

  // Handle storage changes with guards against concurrent updates
  const handleStorageChange = useCallback(
    async (e) => {
      if (e.key === "spotify_auth_completed") {
        // Remove it immediately to prevent duplicate processing
        localStorage.removeItem("spotify_auth_completed");

        // Wait a bit to ensure token is available
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (SpotifyTokenService.hasValidSpotifyToken()) {
          // Only trigger refresh if not already fetching and not in a refresh cycle
          if (!areGenrePlaylistsFetchingRef.current && !refreshInProgressRef.current) {
            refreshInProgressRef.current = true;
            setRefreshGenrePlaylistsSignal((prev) => prev + 1);
            // Reset the flag after a delay to allow state to settle
            setTimeout(() => {
              refreshInProgressRef.current = false;
            }, 100);
          }
        } else {
          // Retry after a short delay
          setTimeout(updateAuthState, 1000);
        }
      }
    },
    [updateAuthState]
  );

  // Setup visibility change listener
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      updateAuthState();
      checkAuthFlag();
    }
  }, [updateAuthState, checkAuthFlag]);

  // Single source of truth for auth state management
  useEffect(() => {
    // Initialize auth and event listeners
    const initialize = async () => {
      // Check for auth completion flag
      checkAuthFlag();

      // Set up event listeners
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("focus", updateAuthState);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Initial auth check
      await updateAuthState();
    };

    // Run initialization
    initialize();

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", updateAuthState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuthFlag, handleStorageChange, handleVisibilityChange, updateAuthState]);

  // Add a periodic token validity check without the isAuthenticated dependency
  useEffect(() => {
    // Initial check
    const checkTokenValidity = () => {
      const isTokenValid = SpotifyTokenService.hasValidSpotifyToken();
      if (isTokenValid !== prevAuthStateRef.current) {
        prevAuthStateRef.current = isTokenValid;
        setIsAuthenticated(isTokenValid);
      }
    };

    // Set up interval for periodic checking
    tokenCheckIntervalRef.current = setInterval(checkTokenValidity, 30000); // Check every 30 seconds

    // Clean up interval on unmount
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, []); // No dependencies prevents the infinite update loop

  // Effect to handle route changes or navigation state with guards against concurrent updates
  useEffect(() => {
    // Throttle frequent checks
    const now = Date.now();
    if (now - lastAuthCheckRef.current < 1000) {
      return;
    }
    lastAuthCheckRef.current = now;

    // Check if we have location state with authCompleted flag (from React Router)
    if (location?.state?.authCompleted) {
      // Only process if token is valid and we're not already fetching and not in a refresh cycle
      if (
        SpotifyTokenService.hasValidSpotifyToken() &&
        !areGenrePlaylistsFetchingRef.current &&
        !refreshInProgressRef.current
      ) {
        refreshInProgressRef.current = true;
        setRefreshGenrePlaylistsSignal((prev) => prev + 1);
        // Reset the flag after a delay to allow state to settle
        setTimeout(() => {
          refreshInProgressRef.current = false;
        }, 100);
      }
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

      // Only fetch if the signal is positive, component is mounted, not already fetching, and not in refresh cycle
      if (
        refreshGenrePlaylistsSignal > 0 &&
        isMounted &&
        !areGenrePlaylistsFetchingRef.current &&
        !refreshInProgressRef.current
      ) {
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
      await GenreService.postGenre({
        name: name,
        parent: parentUuid,
      });
      setRefreshGenrePlaylistsSignal(1);
      return true;
    } catch (error) {
      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return false;
      }
      throw error; // Re-throw other errors
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
    await GenreService.putGenre(genreUuid, {
      parent: parentUuid,
    });
    setRefreshGenrePlaylistsSignal(1);
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
      setRefreshGenrePlaylistsSignal(1);
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
      throw error; // Rethrow other errors for global handling
    }
  };

  const deleteGenre = async (genreUuid) => {
    await GenreService.deleteGenre(genreUuid);
    setRefreshGenrePlaylistsSignal(1);
  };

  // Create a safe version of the refresh function for the context value
  const triggerRefresh = useCallback(() => {
    if (!areGenrePlaylistsFetchingRef.current && !refreshInProgressRef.current) {
      refreshInProgressRef.current = true;
      setRefreshGenrePlaylistsSignal((prev) => prev + 1);
      setTimeout(() => {
        refreshInProgressRef.current = false;
      }, 100);
    }
  }, []);

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
  } catch (e) {
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
