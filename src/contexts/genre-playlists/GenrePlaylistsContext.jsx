import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import GenreService from "@utils/services/GenreService";
import BadRequestError from "@utils/errors/BadRequestError";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";
import InvalidInputContentObject from "@models/popup-content-object/InvalidInputContentObject";
import ApiTokenService from "@utils/services/ApiTokenService";
import useApiConnectivity from "@hooks/useApiConnectivity";
import useAuthChangeHandler from "@hooks/useAuthChangeHandler";
import useAuthState from "@hooks/useAuthState";
import useSpotifyAuthActions from "@hooks/useSpotifyAuthActions";

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

  // Use focused hooks for auth state and actions
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();
  const isAuthenticated = useAuthState();

  // Declare all refs at the top of the component
  const areGenrePlaylistsFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const lastRefreshTimeRef = useRef(0);
  const prevAuthStateRef = useRef(isAuthenticated);
  const refreshInProgressRef = useRef(false);

  // Create safe version of refresh function
  const triggerRefresh = useCallback(() => {
    if (!areGenrePlaylistsFetchingRef.current && !refreshInProgressRef.current) {
      refreshInProgressRef.current = true;
      setRefreshGenrePlaylistsSignalRaw((prev) => prev + 1);
      setTimeout(() => {
        refreshInProgressRef.current = false;
      }, 100);
    }
  }, []);

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: triggerRefresh,
    fetchingRef: areGenrePlaylistsFetchingRef,
    refreshInProgressRef,
  });

  // Define fetchGenrePlaylists before any effects that use it
  const fetchGenrePlaylists = useCallback(async () => {
    console.log("[GenrePlaylistsContext] Starting fetchGenrePlaylists");
    // Check token directly to ensure we have the latest state
    console.log("[GenrePlaylistsContext fetchGenrePlaylists] Checking token status");
    const directTokenCheck = ApiTokenService.hasValidApiToken();
    console.log("[GenrePlaylistsContext] Token check result:", directTokenCheck);

    try {
      if (!directTokenCheck) {
        console.log("[GenrePlaylistsContext] No valid token, showing auth popup");
        setError("Authentication required");
        areGenrePlaylistsFetchingRef.current = false;
        setRefreshGenrePlaylistsSignalRaw(0);
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

      console.log("[GenrePlaylistsContext] Setting fetching flag");
      areGenrePlaylistsFetchingRef.current = true;

      console.log("[GenrePlaylistsContext] Calling GenreService.getGenrePlaylists");
      const genrePlaylists = await GenreService.getGenrePlaylists();
      console.log("[GenrePlaylistsContext] Received genre playlists:", genrePlaylists);

      if (genrePlaylists && genrePlaylists.length > 0) {
        const grouped = getGenrePlaylistsGroupedByRoot(genrePlaylists);
        console.log("[GenrePlaylistsContext] Grouped playlists:", grouped);
        setGroupedGenrePlaylists(grouped);
        setError(null);
      } else {
        console.log("[GenrePlaylistsContext] No playlists found, setting empty object");
        setGroupedGenrePlaylists({});
      }
    } catch (error) {
      console.error("[GenrePlaylistsContext] Error fetching playlists:", error);

      // Handle API connectivity errors
      const isConnectivityError = handleApiError(error, "/api/genre-playlists");

      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
      } else if (!isConnectivityError) {
        // Only set generic error if not a connectivity error (already handled by hook)
        setError(`Failed to load genre playlists: ${error.message || "Unknown error"}`);
      }
    } finally {
      console.log("[GenrePlaylistsContext] Resetting fetching flag");
      areGenrePlaylistsFetchingRef.current = false;
      setRefreshGenrePlaylistsSignalRaw(0);
    }
  }, [checkTokenAndShowAuthIfNeeded, handleApiError]);

  // Setup authentication handling and event listeners
  const { registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback: triggerRefresh,
    isFetchingRef: areGenrePlaylistsFetchingRef,
    refreshInProgressRef: refreshInProgressRef,
  });

  // Setup event listeners and perform initial auth check
  useEffect(() => {
    // Register auth event listeners for storage and visibility changes
    const unregisterListeners = registerListeners();

    // Initial auth check and data refresh if needed
    checkAuthAndRefresh();

    return unregisterListeners;
  }, [registerListeners, checkAuthAndRefresh]);

  // React to changes in authentication state from the AuthContext
  useEffect(() => {
    // Update the reference to track changes
    prevAuthStateRef.current = isAuthenticated;

    // If user becomes authenticated, trigger a data refresh
    if (isAuthenticated && !areGenrePlaylistsFetchingRef.current && !refreshInProgressRef.current) {
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
    if (location?.state?.authCompleted) {
      // Only process if token is valid and we're not already fetching and not in a refresh cycle
      console.log("[GenrePlaylistsContext useEffect] Checking token status");
      if (
        ApiTokenService.hasValidApiToken() &&
        !areGenrePlaylistsFetchingRef.current &&
        !refreshInProgressRef.current
      ) {
        refreshInProgressRef.current = true;
        setRefreshGenrePlaylistsSignalRaw((prev) => prev + 1);
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
      triggerRefresh();
      return true;
    } catch (error) {
      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return false;
      }

      // Handle API connectivity errors
      if (handleApiError(error, "/api/genres")) {
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
    try {
      await GenreService.putGenre(genreUuid, {
        parent: parentUuid,
      });
      triggerRefresh();
    } catch (error) {
      // Handle connectivity errors
      handleApiError(error, `/api/genres/${genreUuid}`);
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

      // Handle API connectivity errors
      if (handleApiError(error, `/api/genres/${genreUuid}`)) {
        return false;
      }

      throw error; // Rethrow other errors for global handling
    }
  };

  const deleteGenre = async (genreUuid) => {
    try {
      await GenreService.deleteGenre(genreUuid);
      triggerRefresh();
    } catch (error) {
      // Handle connectivity errors
      handleApiError(error, `/api/genres/${genreUuid}`);
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
