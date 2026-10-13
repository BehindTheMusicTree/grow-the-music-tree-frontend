"use client";

import { Suspense, useCallback, useEffect, useMemo, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useListFullGenrePlaylists,
  CriteriaMinimum,
  hasMainstreamPopRoot,
  GenreTreeViewSkeleton,
} from "@behindthemusictree/app-kit/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import GenreHistory from "@components/features/genre-tree/GenreHistory";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { useIsAdmin } from "@hooks/useIsAdmin";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

// Reads viewMode from context (rather than receiving it as a prop) because next/dynamic's
// `loading` render prop isn't passed the wrapped component's own props — this renders before
// GenreTreeView ever mounts, so it must source the view mode independently.
//
// `ssr:false` on next/dynamic below only skips the wrapped component itself — Next.js still
// invokes this `loading` fallback on the server. GenreTreeWheelSkeleton (used by
// GenreTreeViewSkeleton for "wheel"/"pop-core") rounds its SVG coordinates well below float
// precision noise, so it renders byte-identically on server and client and can safely SSR.
function GenreTreeViewLoadingFallback() {
  const { viewMode } = useGenreTreeViewMode();

  return (
    <div className="relative flex h-full flex-col">
      <div className="actions-container absolute left-3 top-3 z-30 flex justify-start">
        <div className="flex justify-start" />
      </div>
      <GenreTreeViewSkeleton viewMode={viewMode} />
    </div>
  );
}

const GenreTreeView = dynamic(
  () => import("@behindthemusictree/app-kit/genre-tree").then((mod) => mod.GenreTreeView),
  { ssr: false, loading: () => <GenreTreeViewLoadingFallback /> },
);

const ZOOM_PARAM = "zoom";

type ZoomableGenreTreeViewProps = Omit<
  ComponentProps<typeof GenreTreeView>,
  "focusGenreUuid" | "onFocusGenreChange"
> & {
  genrePlaylists: ReturnType<typeof useListFullGenrePlaylists>["data"];
};

// Reads `?zoom=` in its own component so only this subtree bails out to client rendering
// (useSearchParams needs a Suspense boundary when the route is prerendered).
function ZoomableGenreTreeView({ genrePlaylists, ...viewProps }: ZoomableGenreTreeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const zoom = searchParams.get(ZOOM_PARAM);
  const isPopCore = viewProps.viewMode === "pop-core";

  // The nodes GenreTreeView's pop-core wheel renders (accepted roots' subtrees, minus criteria-less
  // playlists), minus those with several pop children: genre-tree-view throws on any other focus id.
  const popCoreUuids = useMemo(() => {
    const all = genrePlaylists ?? [];
    const unacceptedRootUuids = new Set(all.filter((gp) => gp.isUnacceptedRoot).map((gp) => gp.uuid));
    const visible = all.filter(
      (gp) => gp.criteria && !gp.isUnacceptedRoot && !unacceptedRootUuids.has(gp.root.uuid),
    );
    const popChildCounts = new Map<string, number>();
    visible.forEach((gp) => {
      if (gp.parent && gp.criteria?.side === "pop") {
        popChildCounts.set(gp.parent.uuid, (popChildCounts.get(gp.parent.uuid) ?? 0) + 1);
      }
    });
    return new Set(visible.filter((gp) => (popChildCounts.get(gp.uuid) ?? 0) <= 1).map((gp) => gp.uuid));
  }, [genrePlaylists]);

  const focusGenreUuid = isPopCore && zoom && popCoreUuids.has(zoom) ? zoom : null;
  // While the list is (re)loading the param can't be judged yet, so it is kept, not passed.
  const isZoomStale = zoom !== null && (!isPopCore || (genrePlaylists !== undefined && !popCoreUuids.has(zoom)));

  const hrefWithZoom = useCallback(
    (uuid: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (uuid) params.set(ZOOM_PARAM, uuid);
      else params.delete(ZOOM_PARAM);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  useEffect(() => {
    if (isZoomStale) router.replace(hrefWithZoom(null), { scroll: false });
  }, [isZoomStale, hrefWithZoom, router]);

  const handleFocusGenreChange = useCallback(
    (uuid: string | null) => router.push(hrefWithZoom(uuid), { scroll: false }),
    [hrefWithZoom, router],
  );

  return (
    <GenreTreeView
      {...viewProps}
      {...(isPopCore && { focusGenreUuid, onFocusGenreChange: handleFocusGenreChange })}
    />
  );
}

export default function GenreTreePage() {
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  const { viewMode, setCanShowPopCore } = useGenreTreeViewMode();
  const isAdmin = useIsAdmin();
  const { showPopup, hidePopup } = usePopup();

  // Shares the react-query cache with GenreTreeView's internal fetch (same queryKey), so this
  // doesn't trigger an extra network request. Used only to compute whether the "pop-core" view
  // mode is available, so AppHeader can grey out its toggle button accordingly.
  const { data: genrePlaylists, isLoading: isLoadingGenrePlaylists } = useListFullGenrePlaylists(
    "reference",
    getBackendBaseUrl,
  );

  const canShowPopCore = useMemo(
    () => {
      const all = genrePlaylists ?? [];
      const unacceptedRootUuids = new Set(all.filter((gp) => gp.isUnacceptedRoot).map((gp) => gp.uuid));
      return hasMainstreamPopRoot(
        all
          .filter((gp) => !gp.isUnacceptedRoot && !unacceptedRootUuids.has(gp.root.uuid))
          .map((genrePlaylist) => ({
            id: genrePlaylist.uuid,
            parentId: genrePlaylist.parent?.uuid ?? null,
            name: genrePlaylist.name,
            itemCount: genrePlaylist.tracksCount,
          })),
      );
    },
    [genrePlaylists],
  );

  useEffect(() => {
    setCanShowPopCore(canShowPopCore);
  }, [canShowPopCore, setCanShowPopCore]);

  // No data after loading means the fetch failed; GenreTreeView surfaces that error itself.
  if (
    (viewMode === "pop-core" || viewMode === "outline") &&
    !isLoadingGenrePlaylists &&
    genrePlaylists &&
    !canShowPopCore
  ) {
    throw new Error(`Cannot show "${viewMode}" view: the loaded genre tree has no "Mainstream Pop" root`);
  }

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) => showPopup(<GenreCreationPopup parent={parent} onClose={hidePopup} />),
    [hidePopup, showPopup],
  );

  const showGenreRenamePopup = useCallback(
    (genre: CriteriaMinimum) => showPopup(<GenreRenamePopup genre={genre} onClose={hidePopup} />),
    [hidePopup, showPopup],
  );

  return (
    <Page title="Genre Tree" visuallyHiddenTitle dataPage="genre-tree">
      <Suspense fallback={<GenreTreeViewLoadingFallback />}>
        <ZoomableGenreTreeView
          genrePlaylists={genrePlaylists}
          scope="reference"
          handleGenreCreationAction={showCriteriaCreationPopup}
          handleGenreRenameAction={showGenreRenamePopup}
          getBackendBaseUrl={getBackendBaseUrl}
          viewMode={viewMode}
          readOnly={!isAdmin}
          controlsOrientation="horizontal"
          renderGenreDetailExtras={(overview) => <GenreHistory genreUuid={overview.uuid} />}
        />
      </Suspense>
    </Page>
  );
}
