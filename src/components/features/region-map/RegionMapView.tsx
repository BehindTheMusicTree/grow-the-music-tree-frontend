"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { GenreUuidSchema, useRegionGenreLexicon } from "@behindthemusictree/app-kit/genre-tree";
import { EntityDetailPanel, GenreDetailPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { collapseEdgeTab } from "@utils/collapseEdgeTab";
import { Breadcrumb } from "@behindthemusictree/ui";
import { regionMapLookup } from "@lib/region-map-index";
import { useRegionMapIndex } from "@hooks/useRegionMap";
import { useIsAdmin } from "@hooks/useIsAdmin";
import { useEntityDocumentTitle } from "@hooks/useEntityDocumentTitle";
import GenreHistory from "@components/features/genre-tree/GenreHistory";
import { renderArtistLink } from "@components/features/artist/renderArtistLink";
import { renderPlaceLink } from "@components/features/artist/renderPlaceLink";
import { renderSongLink } from "@components/features/song/renderSongLink";
import { useRegionGenreIndex } from "@components/features/search/useRegionGenreIndex";
import type { GenreTreeShareTarget } from "@behindthemusictree/app-kit-ui/genre-tree";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";
import RegionDetailPanel from "./RegionDetailPanel";
import RegionMapSearch from "./RegionMapSearch";
import type { FocusRequest } from "./RegionMapCanvas";
import { ancestry } from "./regionMapLayers";
import { useRegionMapUrlState, type Camera } from "./useRegionMapUrlState";

const RegionMapCanvas = dynamic(() => import("./RegionMapCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />,
});

const Skeleton = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" aria-busy />;

export default function RegionMapView() {
  const { data: index, isPending, isError } = useRegionMapIndex();

  if (isPending) return <Skeleton />;
  if (isError) return <p className="text-red-600">Could not load the region map.</p>;
  if (index === null) return null;
  return <LoadedRegionMap index={index} />;
}

function LoadedRegionMap({ index }: { index: RegionMapIndex }) {
  const isAdmin = useIsAdmin();
  const { state, update } = useRegionMapUrlState();
  const pathname = usePathname();
  const regions = regionMapLookup(index);
  const selected = state.region === null ? undefined : regions.get(state.region);

  // The URL camera wins; else an old `?path=` link frames its deepest known level, else the selection.
  const [initial] = useState(() => {
    const legacyTarget = state.legacyPath.findLast((id) => regions.has(id));
    const target = legacyTarget ?? (selected ? selected.id : null);
    return {
      camera: state.at,
      focus:
        state.at === null && target !== null && regions.get(target)?.boundaryStatus !== "missing"
          ? { id: target, seq: 0 }
          : null,
    };
  });
  const [focus, setFocus] = useState<FocusRequest | null>(initial.focus);
  // Region and genre of the last framing, so the effects below only fly for selections that did not already
  // call `flyTo` themselves (search and breadcrumb picks); map clicks, back/forward and edited URLs fly here.
  const lastFlown = useRef<string | null>(state.region);
  const lastGenreFlown = useRef<string | null>(
    state.at === null && state.region === null ? null : state.genre,
  );
  const flyTo = useCallback((id: string | null) => {
    lastFlown.current = id;
    if (id !== null && regions.get(id)?.boundaryStatus === "missing") return;
    setFocus((current) => ({ id, seq: (current?.seq ?? 0) + 1 }));
  }, [regions]);

  const [collapsed, setCollapsed] = useState(false);
  const selectedId = state.region;
  // Only a well-formed uuid can be shared or looked up in the lexicon; the panel itself says when a genre is not found.
  const genreUuid = state.genre === null ? null : GenreUuidSchema.safeParse(state.genre).data ?? null;
  const selectedExists = selected !== undefined;
  useEffect(() => {
    if (selectedId === null) lastFlown.current = null;
    else if (selectedExists && selectedId !== lastFlown.current) flyTo(selectedId);
  }, [selectedId, selectedExists, flyTo]);

  // A genre selected from anywhere (family links, URL) frames the region the map lists it under.
  const lexicon = useRegionGenreLexicon(getGrowBackendBaseUrl, genreUuid !== null);
  const genreEntries = useRegionGenreIndex(index, lexicon.entries);
  const genreRegionId = useMemo(() => {
    const own = genreEntries.filter((entry) => entry.genre.uuid === state.genre);
    // Keep the current framing when the selected region already lists the genre.
    if (own.some((entry) => entry.region.id === selectedId)) return null;
    return own[0]?.region.id ?? null;
  }, [genreEntries, state.genre, selectedId]);
  useEffect(() => {
    if (state.genre === null) {
      lastGenreFlown.current = null;
      return;
    }
    if (genreRegionId === null || state.genre === lastGenreFlown.current) return;
    lastGenreFlown.current = state.genre;
    flyTo(genreRegionId);
  }, [state.genre, genreRegionId, flyTo]);
  useEffect(() => {
    setCollapsed(false);
  }, [selectedId, state.genre, state.artist, state.song]);
  // The panel shows the genre over an artist or song, so the tab names what is displayed.
  useEntityDocumentTitle(state.genre === null ? state.artist : null, state.genre === null ? state.song : null);
  const getShareUrl = useCallback(
    (target: GenreTreeShareTarget) => {
      const params = new URLSearchParams();
      if (target.kind === "genre") params.set("genre", target.genreUuid);
      else params.set(target.kind, target.uuid);
      return `${pathname}?${params.toString()}`;
    },
    [pathname],
  );
  const genreHasNoRegion =
    genreUuid !== null && !lexicon.isPending && !lexicon.isError && genreRegionId === null &&
    !genreEntries.some((entry) => entry.genre.uuid === genreUuid);

  const hasLegacyPath = state.legacyPath.length > 0;
  const invalidRegion = state.region !== null && selected === undefined;
  useEffect(() => {
    if (hasLegacyPath || invalidRegion) {
      update({ legacyPath: null, ...(invalidRegion ? { region: null } : {}) }, "replace");
    }
  }, [hasLegacyPath, invalidRegion, update]);

  // Panning is not navigation: the camera replaces the history entry instead of adding one.
  const onCameraChange = useCallback((at: Camera) => update({ at }, "replace"), [update]);

  const select = (region: Region) => { setCollapsed(false); update({ region: region.id, genre: null }); };
  const clearSelection = () => {
    if (state.region !== null || state.genre !== null || state.artist !== null || state.song !== null) {
      update({ region: null, genre: null, artist: null, song: null });
    }
  };
  const pick = useCallback(
    (regionId: string | null, genre: string | null) => {
      setCollapsed(false);
      update({ ...(regionId !== null ? { region: regionId } : {}), genre });
      lastGenreFlown.current = genre;
      if (regionId !== null) flyTo(regionId);
    },
    [update, flyTo],
  );
  const trail = selected ? ancestry(selected, regions) : [];

  return (
    <div className="h-full">
      <div className="relative h-full">
        <RegionMapCanvas
          tileset={index.tileset}
          regions={regions}
          rootIds={index.worldChildIds}
          selectedId={state.region}
          zoneId={selected?.kind === "zone" ? selected.id : null}
          initialCamera={initial.camera}
          focus={focus}
          onRegionClick={select}
          onClearSelection={clearSelection}
          onCameraChange={onCameraChange}
        />
        <RegionMapSearch index={index} regions={regions} onPick={pick} onPickArtist={(artist) => { setCollapsed(false); update({ artist }); }} onPickSong={(song) => { setCollapsed(false); update({ song }); }} selectedRegion={selected} selectedGenreUuid={state.genre} selectedArtistUuid={state.artist} selectedSongUuid={state.song} onClosePanel={clearSelection} className="absolute left-[var(--layout-search-inset)] right-[var(--layout-search-inset)] top-[var(--layout-search-inset)] z-20 md:right-auto md:w-[var(--layout-search-w)]" />
        {genreHasNoRegion && !selected && (
          <p role="status" className="absolute left-1/2 top-[calc(var(--layout-search-inset)+var(--layout-search-h)+0.5rem)] z-10 max-w-[calc(100%-theme(spacing.6))] -translate-x-1/2 rounded bg-white px-3 py-1 shadow">
            This genre has no region on the map.
          </p>
        )}
        {selected && (
          <Breadcrumb
            className="absolute left-1/2 top-[calc(var(--layout-search-inset)+var(--layout-search-h)+0.5rem)] z-10 max-w-[calc(100%-theme(spacing.6))] -translate-x-1/2"
            home={{
              label: "World",
              onSelect: () => {
                update({ region: null, genre: null, artist: null, song: null });
                flyTo(null);
              },
            }}
            items={trail.map((region) => ({ id: region.id, label: region.name }))}
            onSelect={(id) => {
              setCollapsed(false);
              update({ region: id, genre: null });
              flyTo(id);
            }}
            onSelectCurrent={() => { setCollapsed(false); flyTo(selected.id); }}
          />
        )}
        {state.genre !== null ? (
          <GenreDetailPanel
            titleInSearch
            genreUuid={state.genre}
            scope="reference"
            getBackendBaseUrl={getGrowBackendBaseUrl}
            onSelectGenre={(genre) => { setCollapsed(false); update({ genre }); }}
            onClose={clearSelection}
            shareUrl={typeof window === "undefined" ? undefined : window.location.href}
            shareTarget={genreUuid === null ? undefined : { kind: "genre", genreUuid, name: "Genre", scope: "reference", artistUuid: null }}
            collapsed={collapsed}
            edgeTab={collapseEdgeTab(collapsed, setCollapsed)}
            extras={{
              renderGenreDetailExtras: isAdmin ? (overview) => <GenreHistory genreUuid={overview.uuid} /> : undefined,
              renderArtistLink,
              renderSongLink,
            }}
          />
        ) : state.song !== null || state.artist !== null ? (
          <EntityDetailPanel
            scope="reference"
            getBackendBaseUrl={getGrowBackendBaseUrl}
            getShareUrl={getShareUrl}
            songUuid={state.song}
            onSongUuidChange={(song) => (song === null ? clearSelection() : update({ song }))}
            artistUuid={state.artist}
            onArtistUuidChange={(artist) => (artist === null ? clearSelection() : update({ artist }))}
            renderArtistLink={renderArtistLink}
            renderSongLink={renderSongLink}
            renderPlaceLink={renderPlaceLink}
            collapsed={collapsed}
            edgeTab={collapseEdgeTab(collapsed, setCollapsed)}
            onSelectGenre={(genre) => { setCollapsed(false); update({ genre: genre.uuid }); }}
          />
        ) : selected ? (
          <RegionDetailPanel
            key={selected.id}
            region={selected}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onSelectGenre={(genre) => { setCollapsed(false); update({ genre }); }}
            onZoomTo={(region) => flyTo(region.id)}
            onClose={clearSelection}
          />
        ) : null}
      </div>
    </div>
  );
}
