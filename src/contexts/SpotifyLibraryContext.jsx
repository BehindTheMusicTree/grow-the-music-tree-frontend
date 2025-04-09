import { createContext, useState, useContext, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import { SpotifyLibTrackService } from "@utils/services";
import { useAuthenticatedDataRefreshSignal } from "@hooks/useAuthenticatedDataRefreshSignal";

export const SpotifyLibraryContext = createContext();

export function useSpotifyLibrary() {
  const context = useContext(SpotifyLibraryContext);
  if (!context) {
    throw new Error("useSpotifyLibrary must be used within a SpotifyLibraryProvider");
  }
  return context;
}

export function SpotifyLibraryProvider({ children }) {
  const LOADING_KEY = "spotifyLibrary";
  const { triggerRefresh, setLoading, getLoading } = useAuthenticatedDataRefreshSignal();

  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);

  const fetchTracks = useCallback(async () => {
    setLoading(LOADING_KEY, true);
    setError(null);
    try {
      const data = await SpotifyLibTrackService.getTracks();
      setTracks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(LOADING_KEY, false);
    }
  }, [setLoading]);

  const updateTrack = useCallback(
    async (trackId, updates) => {
      setLoading(LOADING_KEY, true);
      setError(null);
      try {
        await SpotifyLibTrackService.updateTrack(trackId, updates);
        triggerRefresh(LOADING_KEY);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(LOADING_KEY, false);
      }
    },
    [setLoading, triggerRefresh]
  );

  const deleteTrack = useCallback(
    async (trackId) => {
      setLoading(LOADING_KEY, true);
      setError(null);
      try {
        await SpotifyLibTrackService.deleteTrack(trackId);
        triggerRefresh(LOADING_KEY);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(LOADING_KEY, false);
      }
    },
    [setLoading, triggerRefresh]
  );

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const loading = getLoading(LOADING_KEY);

  return (
    <SpotifyLibraryContext.Provider
      value={{
        tracks,
        error,
        loading,
        updateTrack,
        deleteTrack,
      }}
    >
      {children}
    </SpotifyLibraryContext.Provider>
  );
}

SpotifyLibraryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
