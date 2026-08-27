"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { GenreTreeViewMode } from "@behindthemusictree/app-kit/genre-tree";
import { isPrototypeRoute } from "@lib/prototype-mode";

interface GenreTreeViewModeContextValue {
  viewMode: GenreTreeViewMode;
  setViewMode: (viewMode: GenreTreeViewMode) => void;
  /** Whether the currently-loaded tree data has a "Mainstream Pop" root, i.e. whether the
   * "pop-core" view mode can be shown. Pushed up from GenreTreePage, which already fetches the
   * tree data, so AppHeader (which doesn't fetch tree data itself) can read it without an extra
   * fetch/prop-drilling path. Defaults to false so the toggle starts disabled until data loads. */
  canShowPopCore: boolean;
  setCanShowPopCore: (canShowPopCore: boolean) => void;
}

const GenreTreeViewModeContext = createContext<GenreTreeViewModeContextValue | null>(null);

/** State is keyed by reference/prototype mode so the two genre trees drive the toggle
 * independently instead of sharing a single view mode across both routes. */
interface ModeState {
  viewMode: GenreTreeViewMode;
  canShowPopCore: boolean;
}

const INITIAL_MODE_STATE: ModeState = { viewMode: "stacked", canShowPopCore: false };

export function GenreTreeViewModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = isPrototypeRoute(pathname) ? "prototype" : "reference";

  const [stateByMode, setStateByMode] = useState<Record<"reference" | "prototype", ModeState>>({
    reference: INITIAL_MODE_STATE,
    prototype: INITIAL_MODE_STATE,
  });

  const setViewMode = useCallback(
    (viewMode: GenreTreeViewMode) => {
      setStateByMode((prev) => ({ ...prev, [mode]: { ...prev[mode], viewMode } }));
    },
    [mode],
  );

  const setCanShowPopCore = useCallback(
    (canShowPopCore: boolean) => {
      setStateByMode((prev) => ({ ...prev, [mode]: { ...prev[mode], canShowPopCore } }));
    },
    [mode],
  );

  const { viewMode, canShowPopCore } = stateByMode[mode];

  return (
    <GenreTreeViewModeContext.Provider value={{ viewMode, setViewMode, canShowPopCore, setCanShowPopCore }}>
      {children}
    </GenreTreeViewModeContext.Provider>
  );
}

export function useGenreTreeViewMode() {
  const context = useContext(GenreTreeViewModeContext);
  if (!context) {
    throw new Error("useGenreTreeViewMode must be used within a GenreTreeViewModeProvider");
  }
  return context;
}
