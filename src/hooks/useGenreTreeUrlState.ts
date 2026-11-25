import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { updateUrlQuery } from "@lib/urlQuery";
import { ARTIST_PARAM, GENRE_PARAM, SONG_PARAM, readQueryParam } from "@lib/entityParams";
import type { FocusChangeReason, GenreTreeViewport } from "@behindthemusictree/app-kit-ui/genre-tree";

export const ZOOM_PARAM = "zoom";
export const VIEW_PARAM = "view";
export const ABOUT_PARAM = "about";
export const SIZE_PARAM = "size";

export { ARTIST_PARAM, GENRE_PARAM, SONG_PARAM };

export type SizeMetric = "songs" | "views";

export function parseViewport(raw: string | null): GenreTreeViewport | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",");
  if (parts.length !== 3) return undefined;
  const [x, y, zoom] = parts.map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(zoom) || zoom <= 0) return undefined;
  return { x, y, zoom };
}

export function formatViewport({ x, y, zoom }: GenreTreeViewport): string {
  return `${x.toFixed(1)},${y.toFixed(1)},${zoom.toFixed(2)}`;
}

interface UseGenreTreeUrlStateOptions {
  viewMode: string;
}

export function useGenreTreeUrlState({ viewMode }: UseGenreTreeUrlStateOptions) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const genre = readQueryParam(searchParams, GENRE_PARAM);
  const zoom = searchParams.get(ZOOM_PARAM);
  const view = searchParams.get(VIEW_PARAM);
  const artist = readQueryParam(searchParams, ARTIST_PARAM);
  const song = readQueryParam(searchParams, SONG_PARAM);
  const sizeMetric: SizeMetric = searchParams.get(SIZE_PARAM) === "views" ? "views" : "songs";
  // Mount-only seed: the library ignores later changes, and later URL writes must not feed back.
  const [defaultViewport, setDefaultViewport] = useState(() => parseViewport(view));
  const previousViewMode = useRef(viewMode);
  const setSelectedGenreUuid = useCallback(
    (id: string | null, method: "push" | "replace" = "push") =>
      updateUrlQuery((params) => {
        if (id) {
          params.set(GENRE_PARAM, id);
          params.delete(ABOUT_PARAM);
          params.delete(SONG_PARAM);
        } else params.delete(GENRE_PARAM);
      }, method, pathname),
    [pathname],
  );

  const setArtistUuid = useCallback(
    (uuid: string | null, method: "push" | "replace" = "push") =>
      updateUrlQuery((params) => {
        if (uuid) {
          params.set(ARTIST_PARAM, uuid);
          params.delete(GENRE_PARAM);
          params.delete(ABOUT_PARAM);
          params.delete(SONG_PARAM);
        } else params.delete(ARTIST_PARAM);
      }, method, pathname),
    [pathname],
  );

  const setSongUuid = useCallback(
    (uuid: string | null, method: "push" | "replace" = "push") =>
      updateUrlQuery((params) => {
        if (uuid) {
          params.set(SONG_PARAM, uuid);
          params.delete(GENRE_PARAM);
          params.delete(ARTIST_PARAM);
          params.delete(ABOUT_PARAM);
        } else params.delete(SONG_PARAM);
      }, method, pathname),
    [pathname],
  );

  const setSizeMetric = useCallback(
    (metric: SizeMetric) =>
      updateUrlQuery((params) => {
        if (metric === "views") params.set(SIZE_PARAM, metric);
        else params.delete(SIZE_PARAM);
      }, "replace", pathname),
    [pathname],
  );

  const setFocus = useCallback(
    (uuid: string | null, reason: FocusChangeReason) =>
      updateUrlQuery(
        (params) => {
          if (uuid) params.set(ZOOM_PARAM, uuid);
          else params.delete(ZOOM_PARAM);
          params.delete(VIEW_PARAM);
        },
        // A rejected zoom must not stay in history, or browser back would land on it again.
        reason === "rejected" ? "replace" : "push",
        pathname,
      ),
    [pathname],
  );

  const onViewportChange = useCallback((viewport: GenreTreeViewport) => {
    const formatted = formatViewport(viewport);
    updateUrlQuery((params) => params.set(VIEW_PARAM, formatted), "replace", pathname);
  }, [pathname]);

  useEffect(() => {
    const modeChanged = previousViewMode.current !== viewMode;
    previousViewMode.current = viewMode;
    if (modeChanged) setDefaultViewport(undefined);

    const stripView = modeChanged && view !== null;
    const stripZoom = zoom !== null && viewMode !== "pop-core";
    const malformedView = view !== null && parseViewport(view) === undefined;
    if (!stripView && !stripZoom && !malformedView) return;
    updateUrlQuery((params) => {
      if (stripView || malformedView) params.delete(VIEW_PARAM);
      if (stripZoom) params.delete(ZOOM_PARAM);
    }, "replace", pathname);
  }, [viewMode, view, zoom, pathname]);

  return {
    selectedGenreUuid: genre,
    setSelectedGenreUuid,
    artistUuid: artist,
    setArtistUuid,
    songUuid: song,
    setSongUuid,
    sizeMetric,
    setSizeMetric,
    focusGenreUuid: zoom,
    setFocus,
    defaultViewport,
    onViewportChange,
  };
}
