"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { usePopup } from "@behindthemusictree/app-kit/popup";
import {
  useVisibleGenrePlaylists,
  CriteriaMinimum,
  hasMainstreamPopRoot,
  genrePlaylistTrackCount,
  GenrePlaylistUuidSchema,
  GenreUuidSchema,
  type GenreUuid,
} from "@behindthemusictree/app-kit/genre-tree";
import {
  GenreTreeViewSkeleton,
  type FocusChangeReason,
  type ParentChange,
  type GenreTreeShareTarget,
  type GenreSearchGroupsProps,
  useGenreRemoteSearchGroup,
} from "@behindthemusictree/app-kit-ui/genre-tree";
import { useUpdateGenreParent } from "@hooks/curation/useUpdateGenreParent";
import GenreCreationPopup from "@components/ui/popup/child/GenreCreationPopup";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import { GenreCurationProvider } from "@components/features/genre-curation/GenreCurationProvider";
import GenreDangerZone from "@components/features/genre-curation/GenreDangerZone";
import GenreSummaryEditor from "@components/features/genre-curation/GenreSummaryEditor";
import EssentialSongsEditor from "@components/features/genre-curation/EssentialSongsEditor";
import SongCheckbox from "@components/features/genre-curation/SongCheckbox";
import SongRowActions from "@components/features/genre-curation/SongRowActions";
import SelectionBar from "@components/features/genre-curation/SelectionBar";
import { useEntityDocumentTitle } from "@hooks/useEntityDocumentTitle";
import { useCenterColumn } from "@hooks/useCenterColumn";
import { updateUrlQuery, type UrlQueryMethod } from "@lib/urlQuery";
import { ABOUT_PARAM, ARTIST_PARAM, GENRE_PARAM, SONG_PARAM, useGenreTreeUrlState } from "@hooks/useGenreTreeUrlState";
import { usePlayerPanel } from "@contexts/PlayerPanelProvider";
import AboutContent from "@components/features/about/AboutContent";
import GenreHistory from "@components/features/genre-tree/GenreHistory";
import { ViewModeToggle } from "@components/features/genre-tree/ViewModeToggle";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";
import { renderSongLink } from "@components/features/song/renderSongLink";
import Page from "@components/ui/Page";
import { useGenreTreeViewMode } from "@contexts/GenreTreeViewModeProvider";
import { useIsAdmin } from "@hooks/useIsAdmin";
import { regionMapLookup } from "@lib/region-map-index";
import { useRegionMapIndex } from "@hooks/useRegionMap";
import { usePlaceSearchGroup } from "@components/features/search/useRegionSearchGroups";
import { mapRegionHref } from "@lib/searchHrefs";
import type { Region } from "@schemas/api/region-map";
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
  | "onSelectedGenreUuidChange"
  | "focusGenreUuid"
  | "onFocusGenreChange"
  | "artistSearch"
  | "onArtistSelect"
  | "artistSearchBaseUrl"
  | "artistUuid"
  | "onArtistUuidChange"
  | "artistExpanded"
  | "onArtistExpandedChange"
  | "songUuid"
  | "onSongUuidChange"
  | "songExpanded"
  | "onSongExpandedChange"
> & {
  setSelectedGenreUuid: (id: GenreUuid | null, method?: "push" | "replace") => void;
  artistUuid: string | null;
  setArtistUuid: (uuid: string | null, method?: "push" | "replace") => void;
  songUuid: string | null;
  setSongUuid: (uuid: string | null, method?: "push" | "replace") => void;
  invalidGenre: boolean;
  focus?: {
    focusGenreUuid: string | null;
    onFocusGenreChange: (uuid: string | null, reason: FocusChangeReason) => void;
  };
};

function ZoomableGenreTreeView({
  setSelectedGenreUuid,
  invalidGenre,
  artistUuid,
  setArtistUuid,
  songUuid,
  setSongUuid,
  focus,
  ...viewProps
}: ZoomableGenreTreeViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getShareUrl = useCallback(
    (target: GenreTreeShareTarget) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(SONG_PARAM);
      if (target.kind === "genre") {
        params.set(GENRE_PARAM, target.genreUuid);
        params.delete(ARTIST_PARAM);
        if (target.artistUuid) params.set(ARTIST_PARAM, target.artistUuid);
      } else if (target.kind === "artist") {
        params.set(ARTIST_PARAM, target.uuid);
        params.delete(GENRE_PARAM);
      } else {
        params.set(SONG_PARAM, target.uuid);
        params.delete(ARTIST_PARAM);
        params.delete(GENRE_PARAM);
      }
      params.delete(ABOUT_PARAM);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );
  const about = searchParams.has(ABOUT_PARAM);
  const { selectedGenreUuid, expanded: detailExpanded = false, onExpandedChange: setDetailExpanded } = viewProps;
  const [detailCollapsed, setDetailCollapsed] = useState(false);
  const { isExpanded: tracklistExpanded, setExpanded: setTracklistExpanded } = usePlayerPanel();

  const closeAbout = useCallback(
    (method: UrlQueryMethod = "push") => updateUrlQuery((params) => params.delete(ABOUT_PARAM), method, pathname),
    [pathname],
  );

  // Kept apart from the genre panel's state, which the tree owns for non-admins.
  const [artistExpanded, setArtistExpanded] = useState(false);
  const [songExpanded, setSongExpanded] = useState(false);
  const collapseDetail = useCallback(
    (expanded: boolean) => {
      setDetailExpanded?.(expanded);
      setArtistExpanded(expanded);
      setSongExpanded(expanded);
    },
    [setDetailExpanded],
  );
  useCenterColumn({
    about,
    closeAbout: () => closeAbout("replace"),
    detailExpanded: detailExpanded || artistExpanded || songExpanded,
    setDetailExpanded: collapseDetail,
    tracklistExpanded,
    setTracklistExpanded,
  });

  useEffect(() => {
    setDetailCollapsed(false);
  }, [selectedGenreUuid, artistUuid, songUuid]);

  useEffect(() => {
    setArtistExpanded(false);
  }, [artistUuid]);

  useEffect(() => {
    setSongExpanded(false);
  }, [songUuid]);

  // The About link only adds its own param, so a stale genre or artist is dropped here.
  useEffect(() => {
    if (about && songUuid) setSongUuid(null, "replace");
    else if (about && artistUuid) setArtistUuid(null, "replace");
    else if (about && (selectedGenreUuid || invalidGenre)) setSelectedGenreUuid(null, "replace");
  }, [about, artistUuid, songUuid, invalidGenre, selectedGenreUuid, setArtistUuid, setSongUuid, setSelectedGenreUuid]);

  useEntityDocumentTitle(artistUuid, songUuid);

  const handleSelectedGenreUuidChange = useCallback(
    (id: GenreUuid | null) => {
      setDetailCollapsed(false);
      setSelectedGenreUuid(id);
      if (id !== null) trackEvent("genre_select");
    },
    [setSelectedGenreUuid],
  );

  const overlayPanel = about
    ? { title: "TheMusicTree", content: <AboutContent onClose={() => closeAbout()} />, onClose: () => closeAbout() }
    : invalidGenre
      ? { title: "Genre unavailable", content: <p role="alert">This genre could not be loaded.</p>, onClose: () => setSelectedGenreUuid(null) }
      : undefined;
  const sharedProps = {
    ...viewProps,
    onSelectedGenreUuidChange: handleSelectedGenreUuidChange,
    overlayPanel,
    collapsed: detailCollapsed,
    onCollapsedChange: setDetailCollapsed,
    placement: "regions" as const,
    showDisplayOptions: false,
    artistUuid,
    onArtistUuidChange: setArtistUuid,
    artistExpanded,
    onArtistExpandedChange: setArtistExpanded,
    songUuid,
    onSongUuidChange: setSongUuid,
    songExpanded,
    onSongExpandedChange: setSongExpanded,
    getShareUrl,
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

function GrowSearchGroups({ query, focused, children, onSelectGenre }: GenreSearchGroupsProps) {
  const router = useRouter();
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  // Place data is fetched once the search box is first focused.
  const regionIndex = useRegionMapIndex(focused);
  const regions = useMemo(
    () => (regionIndex.data ? regionMapLookup(regionIndex.data) : null),
    [regionIndex.data],
  );
  const places = usePlaceSearchGroup(
    regions,
    { ready: !regionIndex.isPending, isError: regionIndex.isError },
    query,
    useCallback((region: Region) => router.push(mapRegionHref(region.id)), [router]),
  );
  const regionGenreGroup = useGenreRemoteSearchGroup(getBackendBaseUrl, query,
    (genre) => onSelectGenre(genre.uuid),
    { key: "regional-genres", treeName: "regional", label: "Regional genres", enabled: focused },
  );
  const extraSearchGroups = useMemo(
    () => [places, regionGenreGroup].filter((group) => group !== undefined),
    [places, regionGenreGroup],
  );

  return children(extraSearchGroups);
}

function GenreTreePageContent() {
  const getBackendBaseUrl = getGrowBackendBaseUrl;
  const { viewMode, setCanShowPopCore } = useGenreTreeViewMode();
  const isAdmin = useIsAdmin();
  const { showPopup, hidePopup } = usePopup();
  const [expanded, setExpanded] = useState(false);
  // The artist filters the visualization independently of the selected genre.
  const artistFilter = useSearchParams().get(ARTIST_PARAM);

  // Shares the react-query cache with GenreTreeView's internal fetches (same queryKeys), so this
  // doesn't trigger extra network requests. Also drives whether the "pop-core" view mode is
  // available, so AppHeader can grey out its toggle button accordingly.
  const { genrePlaylists, isLoading: isLoadingGenrePlaylists } = useVisibleGenrePlaylists({
    scope: "reference",
    getBackendBaseUrl,
    artistUuid: artistFilter,
  });

  const {
    selectedGenreUuid,
    invalidGenre,
    setSelectedGenreUuid,
    artistUuid,
    setArtistUuid,
    songUuid,
    setSongUuid,
    sizeMetric,
    setSizeMetric,
    focusGenreUuid,
    setFocus,
    defaultViewport,
    onViewportChange,
  } = useGenreTreeUrlState({ viewMode });

  const canShowPopCore = useMemo(() => {
    const all = genrePlaylists;
    const unacceptedRootUuids = new Set(all.filter((gp) => gp.isUnacceptedRoot).map((gp) => gp.uuid));
    return hasMainstreamPopRoot(
      all
        .filter((gp) => !gp.isUnacceptedRoot && !unacceptedRootUuids.has(gp.root.uuid))
        .map((genrePlaylist) => ({
          id: genrePlaylist.uuid,
          parentId: genrePlaylist.parent?.uuid ?? null,
          name: genrePlaylist.name,
          itemCount: genrePlaylistTrackCount(genrePlaylist),
        })),
    );
  }, [genrePlaylists]);

  useEffect(() => {
    setCanShowPopCore(canShowPopCore);
  }, [canShowPopCore, setCanShowPopCore]);

  // No data after loading means the fetch failed; GenreTreeView surfaces that error itself.
  if (
    (viewMode === "pop-core" || viewMode === "outline") &&
    !isLoadingGenrePlaylists &&
    genrePlaylists.length > 0 &&
    !canShowPopCore
  ) {
    throw new Error(`Cannot show "${viewMode}" view: the loaded genre tree has no "Mainstream Pop" root`);
  }

  const criteriaByPlaylist = useMemo(
    () => new Map(genrePlaylists.map((genrePlaylist) => [genrePlaylist.uuid, genrePlaylist])),
    [genrePlaylists],
  );
  const playlistForNode = useCallback(
    (node: { id: string }) => criteriaByPlaylist.get(GenrePlaylistUuidSchema.parse(node.id)),
    [criteriaByPlaylist],
  );

  const showCriteriaCreationPopup = useCallback(
    (parent: CriteriaMinimum | null = null) =>
      showPopup(<GenreCreationPopup parent={parent} onClose={hidePopup} onCreated={setSelectedGenreUuid} />),
    [hidePopup, setSelectedGenreUuid, showPopup],
  );

  const showGenreRenamePopup = useCallback(
    (genre: CriteriaMinimum) => showPopup(<GenreRenamePopup genre={genre} onClose={hidePopup} />),
    [hidePopup, showPopup],
  );

  const updateGenreParent = useUpdateGenreParent();
  const handleParentChanged = useCallback(
    ({ genre, from, to }: ParentChange) => {
      const nameOf = (uuid: string) =>
        genrePlaylists.find((genrePlaylist) => genrePlaylist.criteria?.uuid === uuid)?.name;
      const toName = nameOf(to);
      const fromName = from ? nameOf(from) : undefined;
      // The move is already saved; a name missing from this page's filtered list only costs the Undo.
      if (!toName) {
        toast.success("Parent changed");
        return;
      }
      toast.success(`Moved under ${toName}`, {
        action:
          from && fromName
            ? {
                label: "Undo",
                onClick: () =>
                  updateGenreParent.mutate({
                    uuid: genre,
                    parent: { uuid: from, name: fromName },
                    previous: { uuid: to, name: toName },
                  }),
              }
            : undefined,
      });
    },
    [genrePlaylists, updateGenreParent],
  );

  // `satisfies` because a JSX spread skips the excess-property check, which let removed slots linger unnoticed.
  const curation = isAdmin
    ? ({
        expanded,
        onExpandedChange: setExpanded,
        onParentChanged: handleParentChanged,
        renderDangerZone: (node: { id: string }) => {
          const playlist = playlistForNode(node);
          return playlist?.criteria ? (
            <GenreDangerZone
              key={playlist.criteria.uuid}
              genre={playlist.criteria}
              parent={playlist.parent}
              onAliased={(targetUuid) => setSelectedGenreUuid(GenreUuidSchema.parse(targetUuid))}
              onRemoved={() => setSelectedGenreUuid(genrePlaylists.find((item) => item.uuid === playlist.parent?.uuid)?.criteria?.uuid ?? null, "replace")}
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
        renderSongActions: (song: ComponentProps<typeof SongRowActions>["song"]) => <SongRowActions song={song} />,
        renderTracksToolbar: () => <SelectionBar />,
      } satisfies Partial<ComponentProps<typeof GenreTreeView>>)
    : {};

  return (
    <ZoomableGenreTreeView
      scope="reference"
      handleGenreCreationAction={showCriteriaCreationPopup}
      handleGenreRenameAction={showGenreRenamePopup}
      getBackendBaseUrl={getBackendBaseUrl}
      viewMode={viewMode}
      readOnly={!isAdmin}
      invalidGenre={invalidGenre}
      selectedGenreUuid={selectedGenreUuid}
      setSelectedGenreUuid={setSelectedGenreUuid}
      artistUuid={artistUuid}
      setArtistUuid={setArtistUuid}
      songUuid={songUuid}
      setSongUuid={setSongUuid}
      sizeMetric={sizeMetric}
      onSizeMetricChange={setSizeMetric}
      focus={viewMode === "pop-core" ? { focusGenreUuid, onFocusGenreChange: setFocus } : undefined}
      defaultViewport={defaultViewport}
      onViewportChange={onViewportChange}
      floatingControlsLeading={canShowPopCore ? <ViewModeToggle /> : undefined}
      renderGenreDetailExtras={(overview) => <GenreHistory genreUuid={overview.uuid} />}
      renderArtistLink={renderArtistLink}
      renderSongLink={renderSongLink}
      SearchGroups={GrowSearchGroups}
      {...curation}
    />
  );
}
