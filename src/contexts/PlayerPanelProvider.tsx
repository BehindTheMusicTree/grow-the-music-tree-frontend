"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { usePlayer } from "@behindthemusictree/app-kit/player";

interface PlayerPanelContextValue {
  /** Whether the fixed right-hand player panel is on screen: a track is loaded and it wasn't closed. */
  isVisible: boolean;
  dismiss: () => void;
}

const PlayerPanelContext = createContext<PlayerPanelContextValue | null>(null);

export function PlayerPanelProvider({ children }: { children: ReactNode }) {
  const { playerTrackObject } = usePlayer();
  const [dismissed, setDismissed] = useState(false);
  const trackId = playerTrackObject?.track?.id;

  useEffect(() => {
    setDismissed(false);
  }, [trackId]);

  const value = useMemo(
    () => ({ isVisible: !!playerTrackObject && !dismissed, dismiss: () => setDismissed(true) }),
    [playerTrackObject, dismissed],
  );

  return <PlayerPanelContext.Provider value={value}>{children}</PlayerPanelContext.Provider>;
}

export function usePlayerPanel() {
  const context = useContext(PlayerPanelContext);
  if (!context) {
    throw new Error("usePlayerPanel must be used within a PlayerPanelProvider");
  }
  return context;
}
