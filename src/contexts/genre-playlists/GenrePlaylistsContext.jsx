import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import GenreService from "../../utils/services/GenreService";
import BadRequestError from "../../utils/errors/BadRequestError";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";
import InvalidInputContentObject from "../../models/popup-content-object/InvalidInputContentObject";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import SpotifyService from "../../utils/services/SpotifyService";

export const GenrePlaylistsContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <GenrePlaylistsProviderInner location={location}>{children}</GenrePlaylistsProviderInner>;
}

// Inner provider that takes location as a prop
function GenrePlaylistsProviderInner({ children, location }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal] = useState(1);
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  // Track Spotify auth state directly
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyService.hasValidSpotifyToken();
  });

  const areGenrePlaylistsFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const tokenCheckIntervalRef = useRef(null);

  // Single source of truth for auth state management
  useEffect(() => {
    // Check for auth_completed flag and auth state
    const checkAuthFlag = () => {
      const authCompleted = localStorage.getItem("spotify_auth_completed");

      if (authCompleted) {
        // Remove it immediately to prevent duplicate processing
        localStorage.removeItem("spotify_auth_completed");

        // Small delay to ensure token is available and stable
        setTimeout(() => {
          if (SpotifyService.hasValidSpotifyToken() && !areGenrePlaylistsFetchingRef.current) {
            setRefreshGenrePlaylistsSignal((prev) => prev + 1);
          }
        }, 500);

        return true;
      }
      return false;
    };

    const updateAuthState = async () => {
      const currentAuthState = SpotifyService.hasValidSpotifyToken();
      setIsAuthenticated(currentAuthState);

      // If we just became authenticated, check for auth flag
      if (currentAuthState && !areGenrePlaylistsFetchingRef.current) {
        checkAuthFlag();
      }

      return currentAuthState;
    };

    // Handle storage changes
    const handleStorageChange = async (e) => {
      if (e.key === "spotify_auth_completed") {
        // Remove it immediately to prevent duplicate processing
        localStorage.removeItem("spotify_auth_completed");

        // Wait a bit to ensure token is available
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (SpotifyService.hasValidSpotifyToken()) {
          if (!areGenrePlaylistsFetchingRef.current) {
            setRefreshGenrePlaylistsSignal((prev) => prev + 1);
          }
        } else {
          // Retry after a short delay
          setTimeout(updateAuthState, 1000);
        }
      }
    };

    // Setup visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateAuthState();
        checkAuthFlag();
      }
    };

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
  }, []);

  // Add a periodic token validity check to ensure we always have the current auth state
  useEffect(() => {
    // Initial check
    const checkTokenValidity = () => {
      const isTokenValid = SpotifyService.hasValidSpotifyToken();
      if (isTokenValid !== isAuthenticated) {
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
  }, [isAuthenticated]);

  // Effect to handle route changes or navigation state
  useEffect(() => {
    // Throttle frequent checks
    const now = Date.now();
    if (now - lastAuthCheckRef.current < 1000) {
      return;
    }
    lastAuthCheckRef.current = now;

    // Check if we have location state with authCompleted flag (from React Router)
    if (location?.state?.authCompleted) {
      // Only process if token is valid and we're not already fetching
      if (SpotifyService.hasValidSpotifyToken() && !areGenrePlaylistsFetchingRef.current) {
        setRefreshGenrePlaylistsSignal((prev) => prev + 1);
      }
    } else {
      // Otherwise check for the flag in localStorage
      const authCompleted = localStorage.getItem("spotify_auth_completed");
      if (authCompleted && SpotifyService.hasValidSpotifyToken() && !areGenrePlaylistsFetchingRef.current) {
        localStorage.removeItem("spotify_auth_completed");
        setRefreshGenrePlaylistsSignal((prev) => prev + 1);
      }
    }
  }, [location]);

  // Single effect to handle playlist refresh based on auth state
  useEffect(() => {
    if (isAuthenticated && !areGenrePlaylistsFetchingRef.current) {
      setRefreshGenrePlaylistsSignal((prev) => prev + 1);
    }
  }, [isAuthenticated]);

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

  // Improved fetch function with enhanced error handling and debug info
  const fetchGenrePlaylists = useCallback(async () => {
    // Check token directly to ensure we have the latest state
    const directTokenCheck = SpotifyService.hasValidSpotifyToken();

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
  }, [checkTokenAndShowAuthIfNeeded]);

  // Effect to handle playlist refresh
  useEffect(() => {
    if (refreshGenrePlaylistsSignal > 0) {
      fetchGenrePlaylists();
    }
  }, [refreshGenrePlaylistsSignal, fetchGenrePlaylists]);

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

  return (
    <GenrePlaylistsContext.Provider
      value={{
        groupedGenrePlaylists,
        handleGenreAddAction,
        setRefreshGenrePlaylistsSignal,
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
