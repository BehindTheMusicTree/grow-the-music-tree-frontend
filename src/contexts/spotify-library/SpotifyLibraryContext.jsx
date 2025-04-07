import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { usePopup } from "@contexts/popup/usePopup";
import { useNotification } from "@contexts/notification/useNotification";
import SpotifyTracksService from "@utils/services/SpotifyTracksService";
import useSpotifyAuth from "@hooks/useSpotifyAuth";
import { useAuth } from "@contexts/auth/AuthContext";
import ApiErrorPopupContentObject from "@models/popup-content-object/ApiErrorPopupContentObject";
import ConnectivityErrorPopupContentObject from "@models/popup-content-object/ConnectivityErrorPopupContentObject";
import SpotifyAuthErrorPopupContentObject from "@models/popup-content-object/SpotifyAuthErrorPopupContentObject";

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
  const [refreshSignal, setRefreshSignal] = useState(0);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();
  const { isAuthenticated, checkAuth } = useAuth();

  // Declare all refs at the top of the component
  const areTracksFetchingRef = useRef(false);
  const lastAuthCheckRef = useRef(0);
  const tokenCheckIntervalRef = useRef(null);
  const prevAuthStateRef = useRef(isAuthenticated);
  const refreshInProgressRef = useRef(false);

  // Define handleStorageChange with useCallback - with guard against concurrent updates
  const handleStorageChange = useCallback(
    async (event) => {
      if (event.key === "spotify_token_data" && !areTracksFetchingRef.current) {
        try {
          const isTokenValid = await checkAuth();
          if (isTokenValid !== prevAuthStateRef.current) {
            prevAuthStateRef.current = isTokenValid;
            if (isTokenValid && !refreshInProgressRef.current) {
              refreshInProgressRef.current = true;
              setRefreshSignal((prev) => prev + 1);
              setTimeout(() => {
                refreshInProgressRef.current = false;
              }, 100);
            }
          }
        } catch (error) {
          console.error("Error checking auth state:", error);
          setTimeout(checkAuth, 1000);
        }
      }
    },
    [checkAuth]
  );

  // Define handleVisibilityChange with useCallback
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      checkAuth();
    }
  }, [checkAuth]);

  // Single source of truth for auth state management
  useEffect(() => {
    // Initialize auth and event listeners
    const initialize = async () => {
      // Set up event listeners
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("focus", checkAuth);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Initial auth check
      await checkAuth();
    };

    initialize();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuth);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuth, handleStorageChange, handleVisibilityChange]);

  // Add a periodic token validity check without the isAuthenticated dependency
  useEffect(() => {
    const checkTokenValidity = async () => {
      const isTokenValid = await checkAuth();
      if (isTokenValid !== prevAuthStateRef.current) {
        prevAuthStateRef.current = isTokenValid;
        checkAuth();
      }
    };

    tokenCheckIntervalRef.current = setInterval(checkTokenValidity, 30000);

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    };
  }, [checkAuth]);

  // Effect to handle route changes or navigation state - with guard against concurrent updates
  useEffect(() => {
    const handleRouteChange = async () => {
      if (!areTracksFetchingRef.current) {
        try {
          await checkTokenAndShowAuthIfNeeded();
        } catch (error) {
          console.error("Error checking token:", error);
        }
      }
    };

    handleRouteChange();
  }, [location, checkTokenAndShowAuthIfNeeded]);

  // Effect to fetch tracks when refreshSignal changes - with guard against concurrent updates
  useEffect(() => {
    const fetchTracks = async () => {
      if (!areTracksFetchingRef.current) {
        areTracksFetchingRef.current = true;
        setError(null);

        try {
          const tracksData = await SpotifyTracksService.getLibTracks();
          setspotifyLibTracks(tracksData.results || []);
          setError(null);
        } catch (error) {
          console.error("Error fetching tracks:", error);
          setError(error);
        } finally {
          areTracksFetchingRef.current = false;
        }
      }
    };

    fetchTracks();
  }, [refreshSignal]);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyLibTracks,
        error,
        refreshSignal,
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
  } catch (e) {
    // If we're outside Router context, render without location
    return <SpotifyLibraryProviderInner location={null}>{children}</SpotifyLibraryProviderInner>;
  }
}

LocationAwareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

SpotifyLibraryProviderInner.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export { LocationAwareProvider as SpotifyLibraryProvider };

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}
