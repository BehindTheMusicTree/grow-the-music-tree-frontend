import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import SpotifyLibTracksService from "@utils/services/SpotifyLibTracksService";
import ApiTokenService from "@utils/services/ApiTokenService";
import useApiConnectivity from "@hooks/useApiConnectivity";
import useAuthChangeHandler from "@hooks/useAuthChangeHandler";
import useSpotifyAuthActions from "@hooks/useSpotifyAuthActions";

export const SpotifyLibraryContext = createContext();

// Wrapper component that provides location context
function LocationAwareProvider({ children }) {
  const location = useLocation();
  return <SpotifyLibraryProviderInner location={location}>{children}</SpotifyLibraryProviderInner>;
}

// Inner provider that takes location as a prop
function SpotifyLibraryProviderInner({ children, location }) {
  const [spotifyLibTracks, setspotifyLibTracks] = useState([]);
  const [error, setError] = useState(null);
  const [refreshSignal, setRefreshSignalRaw] = useState(0);

  // Use focused hooks for auth state and actions
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();

  // Declare all refs at the top of the component
  const areTracksFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const refreshInProgressRef = useRef(false);

  // Create a safe refresh function
  const triggerRefresh = useCallback(() => {
    if (!areTracksFetchingRef.current && !refreshInProgressRef.current) {
      refreshInProgressRef.current = true;
      setRefreshSignalRaw((prev) => prev + 1);
      setTimeout(() => {
        refreshInProgressRef.current = false;
      }, 100);
    }
  }, []);

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: triggerRefresh,
    fetchingRef: areTracksFetchingRef,
    refreshInProgressRef,
  });

  // Setup authentication handling and event listeners
  const { registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback: triggerRefresh,
    isFetchingRef: areTracksFetchingRef,
    refreshInProgressRef: refreshInProgressRef,
  });

  // Setup auth event listeners and perform initial auth check
  useEffect(() => {
    // Register listeners for storage and visibility changes
    const unregisterListeners = registerListeners();

    // Initial auth check and data refresh if needed
    checkAuthAndRefresh();

    return unregisterListeners;
  }, [registerListeners, checkAuthAndRefresh]);

  // React to changes in authentication state
  useEffect(() => {
    // Update the reference to track changes

    // If user becomes authenticated, trigger data refresh
    if (!areTracksFetchingRef.current && !refreshInProgressRef.current) {
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

    // Check if location state has authCompleted flag (from React Router)
    if (location?.state?.authCompleted) {
      // Only process if token is valid and we're not already fetching and not in a refresh cycle
      console.log("[SpotifyLibraryContext fetchTracks] Checking token status");
      if (ApiTokenService.hasValidApiToken() && !areTracksFetchingRef.current && !refreshInProgressRef.current) {
        triggerRefresh();
      }
    }
  }, [location, triggerRefresh]);

  // Effect to fetch tracks when refreshSignal changes with proper guards
  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      // Only fetch if signal is positive, component is mounted, not already fetching
      if (refreshSignal <= 0 || !isMounted || areTracksFetchingRef.current || refreshInProgressRef.current) {
        return;
      }

      areTracksFetchingRef.current = true;
      setError(null);

      try {
        // Check token directly to ensure we have the latest state
        console.log("[SpotifyLibraryContext fetchTracks] Checking token status");
        const directTokenCheck = ApiTokenService.hasValidApiToken();

        if (!directTokenCheck) {
          setError("Authentication required");
          areTracksFetchingRef.current = false;
          checkTokenAndShowAuthIfNeeded(true);
          return;
        }

        const tracksData = await SpotifyLibTracksService.getLibTracks();
        setspotifyLibTracks(tracksData.results || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching tracks:", error);

        // Handle API connectivity errors
        const isConnectivityError = handleApiError(error, "/api/spotify/tracks");

        if (!isConnectivityError) {
          // Only set error if not a connectivity error (already handled by hook)
          setError("Failed to load Spotify library tracks");
        }

        // Check if this is an auth issue
        if (error.status === 401 || error.status === 403) {
          checkTokenAndShowAuthIfNeeded(true);
        }
      } finally {
        areTracksFetchingRef.current = false;
      }
    };

    fetchTracks();

    return () => {
      isMounted = false;
    };
  }, [refreshSignal, checkTokenAndShowAuthIfNeeded, handleApiError]);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyLibTracks,
        error,
        setRefreshSignal: triggerRefresh,
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
  } catch (_) {
    // If we're outside Router context, render without location
    return <SpotifyLibraryProviderInner location={null}>{children}</SpotifyLibraryProviderInner>;
  }
}

LocationAwareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

SpotifyLibraryProviderInner.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object,
};

export { SpotifyLibraryProvider };

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}
