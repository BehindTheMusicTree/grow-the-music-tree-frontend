import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const TrackListSidebarVisibilityContext = createContext();

export function TrackListSidebarVisibilityProvider({ children }) {
  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  return (
    <TrackListSidebarVisibilityContext.Provider value={{ isTrackListSidebarVisible, setIsTrackListSidebarVisible }}>
      {children}
    </TrackListSidebarVisibilityContext.Provider>
  );
}

TrackListSidebarVisibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
