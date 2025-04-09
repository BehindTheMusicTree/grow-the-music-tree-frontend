import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

export const TrackListContext = createContext();

export function useTrackList() {
  const context = useContext(TrackListContext);
  if (!context) {
    throw new Error("useTrackList must be used within a TrackListProvider");
  }
  return context;
}

export function TrackListProvider({ children }) {
  const [trackList, setTrackList] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        selectedTrack,
        setSelectedTrack,
      }}
    >
      {children}
    </TrackListContext.Provider>
  );
}

TrackListProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
