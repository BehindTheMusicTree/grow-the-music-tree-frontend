import { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import SpotifyLibTracksService from "@utils/services/SpotifyLibTracksService";
import ApiTokenService from "@utils/services/ApiTokenService";
import useSpotifyAuthActions from "@hooks/useSpotifyAuthActions";
import useAuthState from "@hooks/useAuthState";

export const SpotifyLibraryContext = createContext();

export function SpotifyLibraryProvider({ children }) {
  const [spotifyLibTracks, setspotifyLibTracks] = useState([]);
  const [error, setError] = useState(null);
  const isOperationInProgressRef = { current: false };
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();
  const isAuthenticated = useAuthState();

  const fetchTracks = useCallback(async () => {
    if (isOperationInProgressRef.current) {
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
      setError("Failed to load Spotify library tracks");

      if (error.status === 401 || error.status === 403) {
        checkTokenAndShowAuthIfNeeded(true);
      }
    } finally {
      isOperationInProgressRef.current = false;
    }
  }, [checkTokenAndShowAuthIfNeeded]);

  // Effect to fetch tracks when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchTracks();
    }
  }, [isAuthenticated, fetchTracks]);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyLibTracks,
        error,
        refreshTracks: () => {
          if (isAuthenticated) {
            fetchTracks();
          }
        },
      }}
    >
      {children}
    </SpotifyLibraryContext.Provider>
  );
}

SpotifyLibraryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}
