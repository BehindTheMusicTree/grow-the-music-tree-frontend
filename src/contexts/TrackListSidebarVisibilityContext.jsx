"use client";

import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

export const TrackListSidebarVisibilityContext = createContext();

export function useTrackListSidebarVisibility() {
  const context = useContext(TrackListSidebarVisibilityContext);
  if (!context) {
    throw new Error("useTrackListSidebarVisibility must be used within a TrackListSidebarVisibilityProvider");
  }
  return context;
}

export function TrackListSidebarVisibilityProvider({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <TrackListSidebarVisibilityContext.Provider
      value={{
        isVisible,
        setIsVisible,
      }}
    >
      {children}
    </TrackListSidebarVisibilityContext.Provider>
  );
}

TrackListSidebarVisibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
