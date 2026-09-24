"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { GenreTreeViewMode } from "@behindthemusictree/app-kit/genre-tree";

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

interface ModeState {
  viewMode: GenreTreeViewMode;
  canShowPopCore: boolean;
}

export function GenreTreeViewModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModeState>({
    viewMode: "pop-core",
    canShowPopCore: false,
  });

  const setViewMode = useCallback((viewMode: GenreTreeViewMode) => {
    setState((prev) => ({ ...prev, viewMode }));
  }, []);

  const setCanShowPopCore = useCallback((canShowPopCore: boolean) => {
    setState((prev) => ({ ...prev, canShowPopCore }));
  }, []);

  const { viewMode, canShowPopCore } = state;

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
