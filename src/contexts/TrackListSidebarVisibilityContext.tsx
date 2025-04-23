"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TrackListSidebarVisibilityContextType {
  isTrackListSidebarVisible: boolean;
  toggleTrackListSidebar: () => void;
  showTrackListSidebar: () => void;
  hideTrackListSidebar: () => void;
}

const TrackListSidebarVisibilityContext = createContext<TrackListSidebarVisibilityContextType | undefined>(undefined);

interface TrackListSidebarVisibilityProviderProps {
  children: ReactNode;
}

export function TrackListSidebarVisibilityProvider({ children }: TrackListSidebarVisibilityProviderProps) {
  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  const toggleTrackListSidebar = () => {
    setIsTrackListSidebarVisible(!isTrackListSidebarVisible);
  };

  const showTrackListSidebar = () => {
    setIsTrackListSidebarVisible(true);
  };

  const hideTrackListSidebar = () => {
    setIsTrackListSidebarVisible(false);
  };

  return (
    <TrackListSidebarVisibilityContext.Provider
      value={{
        isTrackListSidebarVisible,
        toggleTrackListSidebar,
        showTrackListSidebar,
        hideTrackListSidebar,
      }}
    >
      {children}
    </TrackListSidebarVisibilityContext.Provider>
  );
}

export function useTrackListSidebarVisibility() {
  const context = useContext(TrackListSidebarVisibilityContext);
  if (context === undefined) {
    throw new Error("useTrackListSidebarVisibility must be used within a TrackListSidebarVisibilityProvider");
  }
  return context;
}
