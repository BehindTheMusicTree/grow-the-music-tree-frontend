import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";

export const LibTracksContext = createContext();

export function LibTracksProvider({ children }) {
  const [libTracks, setlibTracks] = useState();
  const [refreshlibTracksSignal, setRefreshlibTracksSignal] = useState(1);

  const areLibTrackFetchingRef = { current: false };

  useEffect(() => {
    const fetchLibTracks = async () => {
      const libTracks = await ApiService.getLibTracks();
      setlibTracks(libTracks);
    };

    if (refreshlibTracksSignal == 1 && !areLibTrackFetchingRef.current) {
      areLibTrackFetchingRef.current = true;
      fetchLibTracks();
      areLibTrackFetchingRef.current = false;
      setRefreshlibTracksSignal(0);
    }
  }, [refreshlibTracksSignal]);

  return (
    <LibTracksContext.Provider value={{ libTracks, setRefreshlibTracksSignal }}>{children}</LibTracksContext.Provider>
  );
}

LibTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
