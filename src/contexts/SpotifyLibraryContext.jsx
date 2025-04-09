import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { SpotifyLibraryService } from "../utils/services";
import useApiConnectivity from "../hooks/useApiConnectivity";
import useAuthState from "../hooks/useAuthState";
import { useAuthenticatedDataRefreshSignal } from "../hooks/useAuthenticatedDataRefreshSignal";
import { handleApiError } from "../utils/apiErrorHandler";
import { checkTokenAndShowAuthIfNeeded } from "../utils/authUtils";

export const SpotifyLibraryContext = createContext();

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}

export function SpotifyLibraryProvider({ children }) {
  const { isAuthenticated } = useAuthState();
  const { checkApiConnectivity } = useApiConnectivity();
  const { triggerRefresh } = useAuthenticatedDataRefreshSignal();

  const [spotifyLibrary, setSpotifyLibrary] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSpotifyLibrary = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      await checkApiConnectivity();
      await checkTokenAndShowAuthIfNeeded();

      const response = await fetch("/api/spotify-library", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSpotifyLibrary(data);
    } catch (error) {
      setError(error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, checkApiConnectivity]);

  useEffect(() => {
    fetchSpotifyLibrary();
  }, [fetchSpotifyLibrary, triggerRefresh]);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        spotifyLibrary,
        error,
        loading,
        setRefreshSignal: triggerRefresh,
      }}
    >
      {children}
    </SpotifyLibraryContext.Provider>
  );
}

SpotifyLibraryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
