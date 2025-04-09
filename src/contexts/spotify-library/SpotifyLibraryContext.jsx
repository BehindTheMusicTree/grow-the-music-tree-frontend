import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import SpotifyLibTracksService from "@utils/services/SpotifyLibTracksService";
import ApiTokenService from "@utils/services/ApiTokenService";
import useApiConnectivity from "@hooks/useApiConnectivity";
import useAuthChangeHandler from "@hooks/useAuthChangeHandler";
import useSpotifyAuthActions from "@hooks/useSpotifyAuthActions";
import { useAuthenticatedDataRefreshSignal } from "@hooks/useAuthenticatedDataRefreshSignal";

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

  const { refreshSignal, setRefreshSignal, isOperationInProgressRef } = useAuthenticatedDataRefreshSignal();
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

  // Effect to handle route changes or navigation state
  useEffect(() => {
    if (location?.state?.authCompleted) {
      if (ApiTokenService.hasValidApiToken() && !isOperationInProgressRef.current) {
        setRefreshSignal();
      }
    }
  }, [location, setRefreshSignal]);

  // Effect to fetch tracks when refreshSignal changes
  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      if (refreshSignal <= 0 || !isMounted || isOperationInProgressRef.current) {
        return;
      }

      isOperationInProgressRef.current = true;
      setError(null);

      try {
        const directTokenCheck = ApiTokenService.hasValidApiToken();

        if (!directTokenCheck) {
          setError("Authentication required");
          isOperationInProgressRef.current = false;
          checkTokenAndShowAuthIfNeeded(true);
          return;
        }

        const tracksData = await SpotifyLibTracksService.getLibTracks();
        setspotifyLibTracks(tracksData.results || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        const isConnectivityError = handleApiError(error, "/api/spotify/tracks");

        if (!isConnectivityError) {
          setError("Failed to load Spotify library tracks");
        }

        if (error.status === 401 || error.status === 403) {
          checkTokenAndShowAuthIfNeeded(true);
        }
      } finally {
        isOperationInProgressRef.current = false;
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
        setRefreshSignal,
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
