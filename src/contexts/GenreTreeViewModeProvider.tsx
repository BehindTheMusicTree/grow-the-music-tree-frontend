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
  /** The view mode GenreTreeView is actually rendering with — may differ from `viewMode` while
   * GenreTreePage is still resolving whether "pop-core" is available (see its `effectiveViewMode`).
   * Pushed up from GenreTreePage so the `next/dynamic` loading fallback, which renders before
   * GenreTreeView mounts and can't read its local state, shows the matching skeleton shape instead
   * of guessing from the raw, not-yet-resolved `viewMode`. Defaults to `viewMode` itself. */
  resolvedViewMode: GenreTreeViewMode;
  setResolvedViewMode: (resolvedViewMode: GenreTreeViewMode) => void;
}

const GenreTreeViewModeContext = createContext<GenreTreeViewModeContextValue | null>(null);

/** State is keyed by reference/prototype mode so the two genre trees drive the toggle
 * independently instead of sharing a single view mode across both routes. */
interface ModeState {
  viewMode: GenreTreeViewMode;
  canShowPopCore: boolean;
  resolvedViewMode: GenreTreeViewMode;
}

export function GenreTreeViewModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = isPrototypeRoute(pathname) ? "prototype" : "reference";

  const [stateByMode, setStateByMode] = useState<Record<"reference" | "prototype", ModeState>>({
    reference: { viewMode: "stacked", canShowPopCore: false, resolvedViewMode: "stacked" },
    prototype: { viewMode: "pop-core", canShowPopCore: false, resolvedViewMode: "pop-core" },
  });

  const setViewMode = useCallback(
    (viewMode: GenreTreeViewMode) => {
      setStateByMode((prev) => {
        const current = prev[mode];
        // Keep resolvedViewMode following viewMode when no override (e.g. GenreTreePage's
        // pop-core-unavailable fallback to "stacked") is active, so consumers like the
        // next/dynamic loading fallback don't render a stale skeleton shape after a toggle
        // click until GenreTreePage's own effect catches up.
        const resolvedViewMode = current.resolvedViewMode === current.viewMode ? viewMode : current.resolvedViewMode;
        return { ...prev, [mode]: { ...current, viewMode, resolvedViewMode } };
      });
    },
    [mode],
  );

  const setCanShowPopCore = useCallback(
    (canShowPopCore: boolean) => {
      setStateByMode((prev) => ({ ...prev, [mode]: { ...prev[mode], canShowPopCore } }));
    },
    [mode],
  );

  const setResolvedViewMode = useCallback(
    (resolvedViewMode: GenreTreeViewMode) => {
      setStateByMode((prev) => ({ ...prev, [mode]: { ...prev[mode], resolvedViewMode } }));
    },
    [mode],
  );

  const { viewMode, canShowPopCore, resolvedViewMode } = stateByMode[mode];

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
