"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useListFullGenrePlaylists,
  CriteriaMinimum,
  hasMainstreamPopRoot,
  type ArtistSearchResult,
} from "@behindthemusictree/app-kit/genre-tree";
import { GenreTreeViewSkeleton, type FocusChangeReason } from "@behindthemusictree/app-kit-ui/genre-tree";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import { GenreCurationProvider } from "@components/features/genre-curation/GenreCurationProvider";
import GenreDangerZone from "@components/features/genre-curation/GenreDangerZone";
import GenreNameEditor from "@components/features/genre-curation/GenreNameEditor";
import GenreParentsEditor from "@components/features/genre-curation/GenreParentsEditor";
import GenreSummaryEditor from "@components/features/genre-curation/GenreSummaryEditor";
import EssentialSongsEditor from "@components/features/genre-curation/EssentialSongsEditor";
import SongCheckbox from "@components/features/genre-curation/SongCheckbox";
import SongRowActions from "@components/features/genre-curation/SongRowActions";
import SelectionBar from "@components/features/genre-curation/SelectionBar";
import AboutContent from "@components/features/about/AboutContent";
import GenreHistory from "@components/features/genre-tree/GenreHistory";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { useIsAdmin } from "@hooks/useIsAdmin";
import { PATHS } from "@lib/constants/routes";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { trackEvent } from "@lib/analytics";

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
      <div className="actions-container absolute left-5 top-5 z-30 flex justify-start">
        <div className="flex justify-start" />
      </div>
      <GenreTreeViewSkeleton viewMode={viewMode} />
    </div>
  );
}

const GenreTreeView = dynamic(
  () => import("@behindthemusictree/app-kit-ui/genre-tree").then((mod) => mod.GenreTreeView),
  { ssr: false, loading: () => <GenreTreeViewLoadingFallback /> },
);

const ZOOM_PARAM = "zoom";
const ABOUT_PARAM = "about";

type ZoomableGenreTreeViewProps = Omit<
  ComponentProps<typeof GenreTreeView>,
  "focusGenreUuid" | "onFocusGenreChange" | "artistSearch" | "onArtistSelect" | "artistSearchBaseUrl"
>;

// Reads `?zoom=` in its own component so only this subtree bails out to client rendering
// (useSearchParams needs a Suspense boundary when the route is prerendered).
function ZoomableGenreTreeView(viewProps: ZoomableGenreTreeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const zoom = searchParams.get(ZOOM_PARAM);
  const about = searchParams.has(ABOUT_PARAM);
  const { onSelectedNodeIdChange } = viewProps;
  const isPopCore = viewProps.viewMode === "pop-core";

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
    if (zoom !== null && !isPopCore) router.replace(hrefWithZoom(null), { scroll: false });
  }, [zoom, isPopCore, hrefWithZoom, router]);

  const closeAbout = useCallback(
    (method: "push" | "replace" = "push") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(ABOUT_PARAM);
    const query = params.toString();
      router[method](query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router],
  );

  useEffect(() => {
    if (about) onSelectedNodeIdChange?.(null);
  }, [about, onSelectedNodeIdChange]);

  const handleSelectedNodeIdChange = useCallback(
    (id: string | null) => {
      onSelectedNodeIdChange?.(id);
      if (id !== null) trackEvent("genre_select");
      if (id !== null && about) closeAbout("replace");
    },
    [about, closeAbout, onSelectedNodeIdChange],
  );

  const overlayPanel = about
    ? { title: "TheMusicTree", content: <AboutContent onClose={() => closeAbout()} />, onClose: () => closeAbout() }
    : undefined;
  const sharedProps = {
    ...viewProps,
    onSelectedNodeIdChange: handleSelectedNodeIdChange,
    overlayPanel,
    showDisplayOptions: false,
    onArtistSelect: (artist: ArtistSearchResult) => router.push(PATHS.ARTIST(artist.uuid)),
  };

  const handleFocusGenreChange = useCallback(
    (uuid: string | null, reason: FocusChangeReason) => {
      const href = hrefWithZoom(uuid);
      // A rejected zoom must not stay in history, or browser back would land on it again.
      if (reason === "rejected") router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [hrefWithZoom, router],
  );

  return isPopCore ? (
    <GenreTreeView {...sharedProps} focusGenreUuid={zoom} onFocusGenreChange={handleFocusGenreChange} />
  ) : (
    <GenreTreeView {...sharedProps} />
  );
}

export default function GenreTreePage() {
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  const { viewMode, setCanShowPopCore } = useGenreTreeViewMode();
  const isAdmin = useIsAdmin();
  const { showPopup, hidePopup } = usePopup();
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  const criteriaByPlaylist = useMemo(
    () => new Map((genrePlaylists ?? []).map((genrePlaylist) => [genrePlaylist.uuid, genrePlaylist])),
    [genrePlaylists],
  );

  const handleEditModeChange = useCallback((on: boolean) => {
    setEditMode(on);
    setExpanded(on);
  }, []);

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) => showPopup(<GenreCreationPopup parent={parent} onClose={hidePopup} />),
    [hidePopup, showPopup],
  );

  const showGenreRenamePopup = useCallback(
    (genre: CriteriaMinimum) => showPopup(<GenreRenamePopup genre={genre} onClose={hidePopup} />),
    [hidePopup, showPopup],
  );

  const curation = isAdmin
    ? {
        editMode,
        onEditModeChange: handleEditModeChange,
        expanded,
        onExpandedChange: setExpanded,
        renderTitleEditor: (node: { id: string }) => {
          const criteria = criteriaByPlaylist.get(node.id)?.criteria;
          return criteria ? <GenreNameEditor key={criteria.uuid} genre={criteria} /> : null;
        },
        renderParentsEditor: (node: { id: string }) => {
          const playlist = criteriaByPlaylist.get(node.id);
          return playlist?.criteria ? (
            <GenreParentsEditor
              key={playlist.criteria.uuid}
              genre={{ uuid: playlist.criteria.uuid, parent: playlist.parent ?? null }}
            />
          ) : null;
        },
        renderDangerZone: (node: { id: string }) => {
          const playlist = criteriaByPlaylist.get(node.id);
          return playlist?.criteria ? (
            <GenreDangerZone
              key={playlist.criteria.uuid}
              genre={playlist.criteria}
              onAliased={(targetUuid) => setSelectedNodeId(targetUuid)}
              onRemoved={() => setSelectedNodeId(playlist.parent?.uuid ?? null)}
            />
          ) : null;
        },
        renderSummary: (overview: ComponentProps<typeof GenreSummaryEditor>["overview"]) => (
          <GenreSummaryEditor overview={overview} />
        ),
        renderEssentialTracks: (overview: ComponentProps<typeof EssentialSongsEditor>["overview"]) => (
          <EssentialSongsEditor overview={overview} />
        ),
        renderSongLeading: (song: ComponentProps<typeof SongCheckbox>["song"], index: number) => (
          <SongCheckbox song={song} index={index} />
        ),
        renderSongActions: (song: ComponentProps<typeof SongRowActions>["song"]) => (
          <SongRowActions song={song} />
        ),
        renderTracksToolbar: () => <SelectionBar />,
      }
    : {};

  return (
    <Page title="Genre Tree" visuallyHiddenTitle dataPage="genre-tree">
      <GenreCurationProvider>
      {/* The overlay panel sits between the detail panel and the player's panel; each side clears gutter + panel width + gutter. */}
      <div
        className="contents [&_.gtv-info-panel--overlay]:left-[calc(var(--layout-gutter)*2+var(--layout-detail-panel-w))] [&_.gtv-info-panel--overlay]:[--gtv-info-panel-header-inset:0px] [--gtv-overlay-panel-right:calc(var(--layout-gutter)*2+var(--layout-player-panel-w))]"
        data-testid="genre-tree-overlay-bounds"
      >
      <Suspense fallback={<GenreTreeViewLoadingFallback />}>
        <ZoomableGenreTreeView
          scope="reference"
          handleGenreCreationAction={showCriteriaCreationPopup}
          handleGenreRenameAction={showGenreRenamePopup}
          getBackendBaseUrl={getBackendBaseUrl}
          viewMode={viewMode}
          readOnly={!isAdmin}
          selectedNodeId={selectedNodeId}
          onSelectedNodeIdChange={setSelectedNodeId}
          renderGenreDetailExtras={(overview) => <GenreHistory genreUuid={overview.uuid} />}
          renderArtistLink={renderArtistLink}
          {...curation}
        />
      </Suspense>
      </div>
      </GenreCurationProvider>
    </Page>
  );
}
