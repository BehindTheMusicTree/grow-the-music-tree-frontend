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
  /** The view mode GenreTreeView is actually rendering with — may differ from `viewMode` while
   * GenreTreePage is still resolving whether "pop-core" is available (see its `effectiveViewMode`).
   * Pushed up from GenreTreePage so the `next/dynamic` loading fallback, which renders before
   * GenreTreeView mounts and can't read its local state, shows the matching skeleton shape instead
   * of guessing from the raw, not-yet-resolved `viewMode`. Defaults to `viewMode` itself. */
  resolvedViewMode: GenreTreeViewMode;
  setResolvedViewMode: (resolvedViewMode: GenreTreeViewMode) => void;
}

const GenreTreeViewModeContext = createContext<GenreTreeViewModeContextValue | null>(null);

interface ModeState {
  viewMode: GenreTreeViewMode;
  canShowPopCore: boolean;
  resolvedViewMode: GenreTreeViewMode;
}

export function GenreTreeViewModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModeState>({
    viewMode: "pop-core",
    canShowPopCore: false,
    resolvedViewMode: "pop-core",
  });

  const setViewMode = useCallback((viewMode: GenreTreeViewMode) => {
    setState((prev) => {
      // Keep resolvedViewMode following viewMode when no override (e.g. GenreTreePage's
      // pop-core-unavailable fallback to "stacked") is active, so consumers like the
      // next/dynamic loading fallback don't render a stale skeleton shape after a toggle
      // click until GenreTreePage's own effect catches up.
      const resolvedViewMode = prev.resolvedViewMode === prev.viewMode ? viewMode : prev.resolvedViewMode;
      return { ...prev, viewMode, resolvedViewMode };
    });
  }, []);

  const setCanShowPopCore = useCallback((canShowPopCore: boolean) => {
    setState((prev) => ({ ...prev, canShowPopCore }));
  }, []);

  const setResolvedViewMode = useCallback((resolvedViewMode: GenreTreeViewMode) => {
    setState((prev) => ({ ...prev, resolvedViewMode }));
  }, []);

  const { viewMode, canShowPopCore, resolvedViewMode } = state;

  return (
    <GenreTreeViewModeContext.Provider
      value={{ viewMode, setViewMode, canShowPopCore, setCanShowPopCore, resolvedViewMode, setResolvedViewMode }}
    >
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
