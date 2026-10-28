import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { FocusChangeReason, GenreTreeViewport } from "@behindthemusictree/app-kit-ui/genre-tree";

export const GENRE_PARAM = "genre";
export const ZOOM_PARAM = "zoom";
export const VIEW_PARAM = "view";
export const ABOUT_PARAM = "about";
export const ARTIST_PARAM = "artist";

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
  genreIds: ReadonlySet<string> | undefined;
}

export function useGenreTreeUrlState({ viewMode, genreIds }: UseGenreTreeUrlStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const genre = searchParams.get(GENRE_PARAM);
  const zoom = searchParams.get(ZOOM_PARAM);
  const view = searchParams.get(VIEW_PARAM);
  const artist = searchParams.get(ARTIST_PARAM);
  // Mount-only seed: the library ignores later changes, and later URL writes must not feed back.
  const [defaultViewport, setDefaultViewport] = useState(() => parseViewport(view));
  const previousViewMode = useRef(viewMode);
  // Only the genre present when the list first loads is validated: later selections (a just-created genre)
  // can legitimately precede the refetch.
  const genreValidated = useRef(false);

  // The tree reports some transitions as two calls in one handler (clear the genre, then open an artist).
  // Applying them as one navigation keeps a single history entry.
  const pending = useRef<{ mutations: ((params: URLSearchParams) => void)[]; method: "push" | "replace" } | null>(null);
  const navigate = useCallback(
    (mutate: (params: URLSearchParams) => void, method: "push" | "replace") => {
      if (pending.current) {
        pending.current.mutations.push(mutate);
        if (method === "push") pending.current.method = "push";
        return;
      }
      const batch = { mutations: [mutate], method };
      pending.current = batch;
      queueMicrotask(() => {
        pending.current = null;
        const params = new URLSearchParams(searchParams.toString());
        batch.mutations.forEach((m) => m(params));
        const query = params.toString();
        router[batch.method](query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const setSelectedNodeId = useCallback(
    (id: string | null, method: "push" | "replace" = "push") =>
      navigate((params) => {
        if (id) {
          params.set(GENRE_PARAM, id);
          params.delete(ABOUT_PARAM);
        } else params.delete(GENRE_PARAM);
      }, method),
    [navigate],
  );

  const setArtistUuid = useCallback(
    (uuid: string | null, method: "push" | "replace" = "push") =>
      navigate((params) => {
        if (uuid) {
          params.set(ARTIST_PARAM, uuid);
          params.delete(GENRE_PARAM);
          params.delete(ABOUT_PARAM);
        } else params.delete(ARTIST_PARAM);
      }, method),
    [navigate],
  );

  const setFocus = useCallback(
    (uuid: string | null, reason: FocusChangeReason) =>
      navigate(
        (params) => {
          if (uuid) params.set(ZOOM_PARAM, uuid);
          else params.delete(ZOOM_PARAM);
          params.delete(VIEW_PARAM);
        },
        // A rejected zoom must not stay in history, or browser back would land on it again.
        reason === "rejected" ? "replace" : "push",
      ),
    [navigate],
  );

  const onViewportChange = useCallback(
    (viewport: GenreTreeViewport) => {
      const formatted = formatViewport(viewport);
      if (formatted === view) return;
      navigate((params) => params.set(VIEW_PARAM, formatted), "replace");
    },
    [navigate, view],
  );

  useEffect(() => {
    const modeChanged = previousViewMode.current !== viewMode;
    previousViewMode.current = viewMode;
    if (modeChanged) setDefaultViewport(undefined);

    const stripView = modeChanged && view !== null;
    const stripZoom = zoom !== null && viewMode !== "pop-core";
    const stripGenre = !genreValidated.current && genre !== null && genreIds !== undefined && !genreIds.has(genre);
    if (genreIds !== undefined) genreValidated.current = true;
    const malformedView = view !== null && parseViewport(view) === undefined;
    if (!stripView && !stripZoom && !stripGenre && !malformedView) return;
    navigate((params) => {
      if (stripView || malformedView) params.delete(VIEW_PARAM);
      if (stripZoom) params.delete(ZOOM_PARAM);
      if (stripGenre) params.delete(GENRE_PARAM);
    }, "replace");
  }, [viewMode, view, zoom, genre, genreIds, navigate]);

  return {
    selectedNodeId: genre,
    setSelectedNodeId,
    artistUuid: artist,
    setArtistUuid,
    focusGenreUuid: zoom,
    setFocus,
    defaultViewport,
    onViewportChange,
  };
}
