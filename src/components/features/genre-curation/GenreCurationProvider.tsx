"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import { usePopup } from "@behindthemusictree/app-kit/popup";

export interface CuratedGenre {
  uuid: GenreUuid;
  name: string;
}

interface GenreCurationContextValue {
  genre: CuratedGenre | null;
  setGenre: (genre: CuratedGenre) => void;
  selected: ReadonlySet<string>;
  toggle: (uuid: string, index: number, range: boolean) => void;
  registerRow: (index: number, uuid: string) => () => void;
  clearSelection: () => void;
  openDialog: (render: (close: () => void) => ReactNode) => void;
}

const GenreCurationContext = createContext<GenreCurationContextValue | null>(null);

export function useGenreCuration(): GenreCurationContextValue {
  const context = useContext(GenreCurationContext);
  if (!context) throw new Error("useGenreCuration must be used inside GenreCurationProvider");
  return context;
}

export function GenreCurationProvider({ children }: { children: ReactNode }) {
  const { showPopup, hidePopup } = usePopup();
  const [genre, setGenreState] = useState<CuratedGenre | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const rows = useRef<Record<number, string>>({});
  const anchor = useRef<number | null>(null);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    anchor.current = null;
  }, []);

  const setGenre = useCallback(
    (next: CuratedGenre) => {
      setGenreState((current) => {
        if (current?.uuid === next.uuid) return current?.name === next.name ? current : next;
        rows.current = {};
        clearSelection();
        return next;
      });
    },
    [clearSelection],
  );

  const registerRow = useCallback((index: number, uuid: string) => {
    rows.current[index] = uuid;
    return () => {
      if (rows.current[index] === uuid) delete rows.current[index];
    };
  }, []);

  const toggle = useCallback((uuid: string, index: number, range: boolean) => {
    const previousAnchor = anchor.current;
    setSelected((current) => {
      const next = new Set(current);
      if (range && previousAnchor !== null) {
        const [from, to] = [Math.min(previousAnchor, index), Math.max(previousAnchor, index)];
        for (let i = from; i <= to; i++) if (rows.current[i]) next.add(rows.current[i]);
      } else if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
    anchor.current = index;
  }, []);

  const openDialog = useCallback(
    (render: (close: () => void) => ReactNode) => {
      const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const close = () => {
        hidePopup();
        origin?.focus();
      };
      showPopup(render(close));
    },
    [hidePopup, showPopup],
  );

  const value = useMemo(
    () => ({ genre, setGenre, selected, toggle, registerRow, clearSelection, openDialog }),
    [genre, setGenre, selected, toggle, registerRow, clearSelection, openDialog],
  );
  return <GenreCurationContext.Provider value={value}>{children}</GenreCurationContext.Provider>;
}
