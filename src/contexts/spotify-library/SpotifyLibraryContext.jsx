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
  const [refreshSignal, setRefreshSignal] = useState(1);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  // Track Spotify auth state directly
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyService.hasValidSpotifyToken();
  });

  const areTracksFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const tokenCheckIntervalRef = useRef(null);

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
          if (SpotifyService.hasValidSpotifyToken() && !areTracksFetchingRef.current) {
            setRefreshSignal((prev) => prev + 1);
          }
        }, 500);

        return true;
      }
      return false;
    };

    const updateAuthState = async () => {
      const currentAuthState = SpotifyService.hasValidSpotifyToken();
      setIsAuthenticated(currentAuthState);
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
          if (!areTracksFetchingRef.current) {
            setRefreshSignal((prev) => prev + 1);
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
      if (SpotifyService.hasValidSpotifyToken() && !areTracksFetchingRef.current) {
        setRefreshSignal((prev) => prev + 1);
      }
    }
  }, [location]);

  // Effect to handle refresh signal
  useEffect(() => {
    if (refreshSignal > 0 && !areTracksFetchingRef.current) {
      fetchSpotifyTracks();
    }
  }, [refreshSignal, fetchSpotifyTracks]);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyTracks,
        error,
        isAuthenticated,
        fetchSpotifyTracks: () => setRefreshSignal((prev) => prev + 1),
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
