"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface NightModeContextValue {
  nightMode: boolean;
  toggleNightMode: () => void;
}

const NightModeContext = createContext<NightModeContextValue | null>(null);

/** Whether the region map dims the side of the globe facing away from the Sun. Off at every load: not persisted. */
export function NightModeProvider({ children }: { children: ReactNode }) {
  const [nightMode, setNightMode] = useState(false);
  const toggleNightMode = useCallback(() => setNightMode((current) => !current), []);

  return <NightModeContext.Provider value={{ nightMode, toggleNightMode }}>{children}</NightModeContext.Provider>;
}

export function useNightMode() {
  const context = useContext(NightModeContext);
  if (!context) {
    throw new Error("useNightMode must be used within a NightModeProvider");
  }
  return context;
}
