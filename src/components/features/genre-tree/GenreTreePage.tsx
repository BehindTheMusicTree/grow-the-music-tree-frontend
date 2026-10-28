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
import { useCenterColumn } from "@hooks/useCenterColumn";
import { ABOUT_PARAM, useGenreTreeUrlState } from "@hooks/useGenreTreeUrlState";
import { usePlayerPanel } from "@contexts/PlayerPanelProvider";
import AboutContent from "@components/features/about/AboutContent";
import GenreHistory from "@components/features/genre-tree/GenreHistory";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";
import { useArtistPanel } from "@components/features/artist/useArtistPanel";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { useIsAdmin } from "@hooks/useIsAdmin";
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

type ZoomableGenreTreeViewProps = Omit<
  ComponentProps<typeof GenreTreeView>,
  "onSelectedNodeIdChange" | "focusGenreUuid" | "onFocusGenreChange" | "artistSearch" | "onArtistSelect" | "artistSearchBaseUrl"
> & {
  setSelectedNodeId: (id: string | null, method?: "push" | "replace") => void;
  artistUuid: string | null;
  setArtistUuid: (uuid: string | null, method?: "push" | "replace") => void;
  focus?: { focusGenreUuid: string | null; onFocusGenreChange: (uuid: string | null, reason: FocusChangeReason) => void };
};

function ZoomableGenreTreeView({ setSelectedNodeId, artistUuid, setArtistUuid, focus, ...viewProps }: ZoomableGenreTreeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const about = searchParams.has(ABOUT_PARAM);
  const {
    selectedNodeId,
    expanded: detailExpanded = false,
    onExpandedChange: setDetailExpanded,
  } = viewProps;
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  const { isExpanded: tracklistExpanded, setExpanded: setTracklistExpanded } = usePlayerPanel();

  const closeAbout = useCallback(
    (method: "push" | "replace" = "push") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(ABOUT_PARAM);
    const query = params.toString();
      router[method](query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, searchParams, router],
  );

  // Kept apart from the genre panel's state, which the tree owns for non-admins.
  const [artistExpanded, setArtistExpanded] = useState(false);
  const collapseDetail = useCallback(
    (expanded: boolean) => {
      setDetailExpanded?.(expanded);
      setArtistExpanded(expanded);
    },
    [setDetailExpanded],
  );
  useCenterColumn({
    about,
    closeAbout: () => closeAbout("replace"),
    detailExpanded: detailExpanded || artistExpanded,
    setDetailExpanded: collapseDetail,
    tracklistExpanded,
    setTracklistExpanded,
  });

  useEffect(() => {
    setDetailCollapsed(false);
  }, [selectedNodeId, artistUuid]);

  useEffect(() => {
    setArtistExpanded(false);
  }, [artistUuid]);

  // The brand layout tokens derive the center column, header and extended player from this variable.
  const isDetailHidden = detailCollapsed || (!selectedNodeId && !artistUuid);
  useEffect(() => {
    if (!isDetailHidden) return undefined;
    const root = document.documentElement;
    root.style.setProperty("--layout-left-w", "0px");
    return () => {
      root.style.removeProperty("--layout-left-w");
    };
  }, [isDetailHidden]);

  // About and artist links only add their own param, so a stale genre or artist is dropped here.
  useEffect(() => {
    if (about && artistUuid) setArtistUuid(null, "replace");
    else if ((about || artistUuid) && selectedNodeId) setSelectedNodeId(null, "replace");
  }, [about, artistUuid, selectedNodeId, setArtistUuid, setSelectedNodeId]);

  const artistPanel = useArtistPanel({
    uuid: artistUuid,
    expanded: artistExpanded,
    onExpandedChange: setArtistExpanded,
    collapsed: detailCollapsed,
    onClose: () => setArtistUuid(null),
  });

  const handleSelectedNodeIdChange = useCallback(
    (id: string | null) => {
      setSelectedNodeId(id);
      if (id !== null) trackEvent("genre_select");
    },
    [setSelectedNodeId],
  );

  const overlayPanel = about
    ? { title: "TheMusicTree", content: <AboutContent onClose={() => closeAbout()} />, onClose: () => closeAbout() }
    : artistPanel;
  const sharedProps = {
    ...viewProps,
    onSelectedNodeIdChange: handleSelectedNodeIdChange,
    overlayPanel,
    collapsed: detailCollapsed,
    onCollapsedChange: setDetailCollapsed,
    placement: "regions" as const,
    showDisplayOptions: false,
    onArtistSelect: (artist: ArtistSearchResult) => setArtistUuid(artist.uuid),
  };

  return focus ? <GenreTreeView {...sharedProps} {...focus} /> : <GenreTreeView {...sharedProps} />;
}

export default function GenreTreePage() {
  return (
    <Page title="Genre Tree" visuallyHiddenTitle dataPage="genre-tree">
      <GenreCurationProvider>
        {/* useSearchParams needs a Suspense boundary when the route is prerendered. */}
        <Suspense fallback={<GenreTreeViewLoadingFallback />}>
          <GenreTreePageContent />
        </Suspense>
      </GenreCurationProvider>
    </Page>
  );
}

function GenreTreePageContent() {
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  const { viewMode, setCanShowPopCore } = useGenreTreeViewMode();
  const isAdmin = useIsAdmin();
  const { showPopup, hidePopup } = usePopup();
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Shares the react-query cache with GenreTreeView's internal fetch (same queryKey), so this
  // doesn't trigger an extra network request. Used only to compute whether the "pop-core" view
  // mode is available, so AppHeader can grey out its toggle button accordingly.
  const { data: genrePlaylists, isLoading: isLoadingGenrePlaylists } = useListFullGenrePlaylists(
    "reference",
    getBackendBaseUrl,
  );

  const genreIds = useMemo(
    () => (genrePlaylists ? new Set(genrePlaylists.map((genrePlaylist) => genrePlaylist.uuid)) : undefined),
    [genrePlaylists],
  );
  const {
    selectedNodeId,
    setSelectedNodeId,
    artistUuid,
    setArtistUuid,
    focusGenreUuid,
    setFocus,
    defaultViewport,
    onViewportChange,
  } = useGenreTreeUrlState({ viewMode, genreIds });

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
    (parent: CriteriaMinimum | null = null) =>
      showPopup(<GenreCreationPopup parent={parent} onClose={hidePopup} onCreated={(id) => setSelectedNodeId(id)} />),
    [hidePopup, setSelectedNodeId, showPopup],
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
              onRemoved={() => setSelectedNodeId(playlist.parent?.uuid ?? null, "replace")}
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
    <ZoomableGenreTreeView
      scope="reference"
      handleGenreCreationAction={showCriteriaCreationPopup}
      handleGenreRenameAction={showGenreRenamePopup}
      getBackendBaseUrl={getBackendBaseUrl}
      viewMode={viewMode}
      readOnly={!isAdmin}
      selectedNodeId={selectedNodeId}
      setSelectedNodeId={setSelectedNodeId}
      artistUuid={artistUuid}
      setArtistUuid={setArtistUuid}
      focus={viewMode === "pop-core" ? { focusGenreUuid, onFocusGenreChange: setFocus } : undefined}
      defaultViewport={defaultViewport}
      onViewportChange={onViewportChange}
      renderGenreDetailExtras={(overview) => <GenreHistory genreUuid={overview.uuid} />}
      renderArtistLink={renderArtistLink}
      {...curation}
    />
  );
}
