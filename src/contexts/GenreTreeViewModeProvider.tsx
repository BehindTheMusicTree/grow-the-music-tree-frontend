"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { GenreTreeViewMode } from "@behindthemusictree/app-kit/genre-tree";

interface GenreTreeViewModeContextValue {
  viewMode: GenreTreeViewMode;
  setViewMode: (viewMode: GenreTreeViewMode) => void;
}

const GenreTreeViewModeContext = createContext<GenreTreeViewModeContextValue | null>(null);

export function GenreTreeViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<GenreTreeViewMode>("stacked");

  return (
    <GenreTreeViewModeContext.Provider value={{ viewMode, setViewMode }}>{children}</GenreTreeViewModeContext.Provider>
  );
}

export function useGenreTreeViewMode() {
  const context = useContext(GenreTreeViewModeContext);
  if (!context) {
    throw new Error("useGenreTreeViewMode must be used within a GenreTreeViewModeProvider");
  }
  return context;
}
