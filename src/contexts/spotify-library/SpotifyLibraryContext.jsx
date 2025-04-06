import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import { SpotifyTracksService } from "../../utils/services";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import SpotifyService from "../../utils/services/SpotifyService";

export const SpotifyLibraryContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <SpotifyLibraryProviderInner location={location}>{children}</SpotifyLibraryProviderInner>;
}

// Inner provider that takes location as a prop
function SpotifyLibraryProviderInner({ children, location }) {
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [error, setError] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0); // Start with 0 to prevent automatic fetch on mount
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  // Track Spotify auth state directly
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyService.hasValidSpotifyToken();
  });

  // Declare all refs at the top of the component
  const areTracksFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const tokenCheckIntervalRef = useRef(null);
  const prevAuthStateRef = useRef(isAuthenticated);
  const refreshInProgressRef = useRef(false);

  // Define fetchSpotifyTracks before any effects that use it
  const fetchSpotifyTracks = useCallback(async () => {
    // Check token directly to ensure we have the latest state
    const directTokenCheck = SpotifyService.hasValidSpotifyToken();

    try {
      if (!directTokenCheck) {
        setError("Authentication required");
        areTracksFetchingRef.current = false;
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

      areTracksFetchingRef.current = true;

      const tracksData = await SpotifyTracksService.getLibTracks();
      setSpotifyTracks(tracksData.results || []);
      setError(null);
    } catch (error) {
      setError(`Failed to load Spotify tracks: ${error.message || "Unknown error"}`);
    } finally {
      areTracksFetchingRef.current = false;
    }
  }, [checkTokenAndShowAuthIfNeeded]);

  // Define updateAuthState with useCallback - removing isAuthenticated dependency
  const updateAuthState = useCallback(async () => {
    const currentAuthState = SpotifyService.hasValidSpotifyToken();
    if (currentAuthState !== prevAuthStateRef.current) {
      prevAuthStateRef.current = currentAuthState;
      setIsAuthenticated(currentAuthState);
    }
    return currentAuthState;
  }, []);

  // Define checkAuthFlag with useCallback - with guard against concurrent updates
  const checkAuthFlag = useCallback(() => {
    const authCompleted = localStorage.getItem("spotify_auth_completed");

    if (authCompleted) {
      // Remove it immediately to prevent duplicate processing
      localStorage.removeItem("spotify_auth_completed");

      // Small delay to ensure token is available and stable
      setTimeout(() => {
        // Only trigger refresh if not already fetching and not in a refresh cycle
        if (SpotifyService.hasValidSpotifyToken() && !areTracksFetchingRef.current && !refreshInProgressRef.current) {
          refreshInProgressRef.current = true;
          setRefreshSignal((prev) => prev + 1);
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

  // Define handleStorageChange with useCallback - with guard against concurrent updates
  const handleStorageChange = useCallback(
    async (e) => {
      if (e.key === "spotify_auth_completed") {
        // Remove it immediately to prevent duplicate processing
        localStorage.removeItem("spotify_auth_completed");

        // Wait a bit to ensure token is available
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (SpotifyService.hasValidSpotifyToken()) {
          // Only trigger refresh if not already fetching and not in a refresh cycle
          if (!areTracksFetchingRef.current && !refreshInProgressRef.current) {
            refreshInProgressRef.current = true;
            setRefreshSignal((prev) => prev + 1);
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

  // Define handleVisibilityChange with useCallback
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
      const isTokenValid = SpotifyService.hasValidSpotifyToken();
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

  // Effect to handle route changes or navigation state - with guard against concurrent updates
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
      if (SpotifyService.hasValidSpotifyToken() && !areTracksFetchingRef.current && !refreshInProgressRef.current) {
        refreshInProgressRef.current = true;
        setRefreshSignal((prev) => prev + 1);
        // Reset the flag after a delay to allow state to settle
        setTimeout(() => {
          refreshInProgressRef.current = false;
        }, 100);
      }
    }
  }, [location]);

  // Effect to handle refresh signal - with better debounce and guard against infinite loops
  useEffect(() => {
    let isMounted = true;

    const handleRefresh = async () => {
      // Only fetch if the signal is positive, component is mounted, not already fetching, and not in refresh cycle
      if (refreshSignal > 0 && isMounted && !areTracksFetchingRef.current && !refreshInProgressRef.current) {
        await fetchSpotifyTracks();
      }
    };

    handleRefresh();

    return () => {
      isMounted = false;
    };
  }, [refreshSignal, fetchSpotifyTracks]);

  // Create a safe version of the fetchSpotifyTracks function for the context value
  const triggerFetch = useCallback(() => {
    if (!areTracksFetchingRef.current && !refreshInProgressRef.current) {
      refreshInProgressRef.current = true;
      setRefreshSignal((prev) => prev + 1);
      setTimeout(() => {
        refreshInProgressRef.current = false;
      }, 100);
    }
  }, []);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyTracks,
        error,
        isAuthenticated,
        fetchSpotifyTracks: triggerFetch,
      }}
    >
      {children}
    </SpotifyLibraryContext.Provider>
  );
}

// Main provider component that handles both Router and non-Router contexts
function SpotifyLibraryProvider({ children }) {
  try {
    // Try to render with location context
    return <LocationAwareProvider>{children}</LocationAwareProvider>;
  } catch (e) {
    // If we're outside Router context, render without location
    return <SpotifyLibraryProviderInner location={null}>{children}</SpotifyLibraryProviderInner>;
  }
}

SpotifyLibraryProviderInner.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

LocationAwareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

SpotifyLibraryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { SpotifyLibraryProvider };
export default SpotifyLibraryProvider;
