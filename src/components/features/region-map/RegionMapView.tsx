"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GenreUuidSchema, useRegionGenreLexicon } from "@behindthemusictree/app-kit/genre-tree";
import { GenreDetailPanel } from "@behindthemusictree/app-kit-ui/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { collapseEdgeTab } from "@utils/collapseEdgeTab";
import { Breadcrumb, DetailPanel } from "@behindthemusictree/ui";
import { regionMapLookup } from "@lib/region-map-index";
import { useRegionMapIndex } from "@hooks/useRegionMap";
import { useRegionGenreIndex } from "@components/features/search/useRegionGenreIndex";
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
  const { state, update } = useRegionMapUrlState();
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
  // call `flyTo` themselves (map click, back/forward, edited URL, family links).
  const lastFlown = useRef<string | null>(state.region);
  const lastGenreFlown = useRef<string | null>(state.genre);
  const flyTo = useCallback((id: string | null) => {
    lastFlown.current = id;
    if (id !== null && regions.get(id)?.boundaryStatus === "missing") return;
    setFocus((current) => ({ id, seq: (current?.seq ?? 0) + 1 }));
  }, [regions]);
  const missingBoundaries = index.regions
    .filter((region) => region.boundaryStatus === "missing")
    .sort((a, b) => a.name.localeCompare(b.name));

  const [collapsed, setCollapsed] = useState(false);
  const selectedId = state.region;
  const parsedGenre = GenreUuidSchema.safeParse(state.genre);
  const selectedExists = selected !== undefined;
  useEffect(() => {
    if (selectedId !== null && selectedExists && selectedId !== lastFlown.current) flyTo(selectedId);
  }, [selectedId, selectedExists, flyTo]);

  // A genre selected from anywhere (family links, URL) frames the region the map lists it under.
  const lexicon = useRegionGenreLexicon(getGrowBackendBaseUrl, state.genre !== null);
  const genreEntries = useRegionGenreIndex(index, lexicon.entries);
  const genreRegionId = useMemo(
    () => genreEntries.find((entry) => entry.genre.uuid === state.genre)?.region.id ?? null,
    [genreEntries, state.genre],
  );
  useEffect(() => {
    if (state.genre === null || genreRegionId === null || state.genre === lastGenreFlown.current) return;
    lastGenreFlown.current = state.genre;
    flyTo(genreRegionId);
  }, [state.genre, genreRegionId, flyTo]);
  useEffect(() => {
    setCollapsed(false);
  }, [selectedId, state.genre]);

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
    if (state.region !== null || state.genre !== null) update({ region: null, genre: null });
  };
  const pick = useCallback(
    (regionId: string | null, genre: string | null) => {
      setCollapsed(false);
      update({ ...(regionId !== null ? { region: regionId } : {}), genre });
      if (regionId !== null) flyTo(regionId);
    },
    [update, flyTo],
  );
  const trail = selected ? ancestry(selected, regions) : [];

  return (
    <div className="flex h-full flex-col gap-3">
      {missingBoundaries.length > 0 && (
        <label className="flex items-center gap-3">
          Regions without a boundary
          <select
            value={selected?.boundaryStatus === "missing" ? selected.id : ""}
            onChange={(event) => {
              const region = regions.get(event.target.value);
              if (region) select(region);
            }}
          >
            <option value="">Choose a region</option>
            {missingBoundaries.map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </label>
      )}
      {selected?.boundaryStatus === "missing" && (
        <p role="status">Boundary unavailable for {selected.name}. Its music remains available below.</p>
      )}
      <div className="relative min-h-0 flex-1">
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
        <RegionMapSearch index={index} regions={regions} onPick={pick} selectedGenreUuid={state.genre} className="absolute left-3 right-3 top-3 z-20 sm:right-auto sm:w-80" />
        {selected && (
          <Breadcrumb
            className="absolute left-1/2 top-16 z-10 max-w-[calc(100%-theme(spacing.6))] -translate-x-1/2"
            home={{
              label: "World",
              onSelect: () => {
                update({ region: null, genre: null });
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
        {state.genre !== null ? parsedGenre.success ? (
          <GenreDetailPanel
            headerClassName="md:pt-[calc(var(--layout-search-h)+theme(spacing.6))]"
            genreUuid={parsedGenre.data}
            scope="reference"
            getBackendBaseUrl={getGrowBackendBaseUrl}
            onSelectGenre={(genre) => { setCollapsed(false); update({ genre }); }}
            onClose={() => update({ genre: null })}
            shareUrl={typeof window === "undefined" ? undefined : window.location.href}
            shareTarget={{ kind: "genre", genreUuid: parsedGenre.data, name: "Genre", scope: "reference", artistUuid: null }}
            collapsed={collapsed}
            edgeTab={collapseEdgeTab(collapsed, setCollapsed)}
          />
        ) : (
          <DetailPanel headerClassName="md:pt-[calc(var(--layout-search-h)+theme(spacing.6))]" title="Genre unavailable" side="left" onClose={() => update({ genre: null })}>
            <p role="alert">This genre could not be loaded.</p>
          </DetailPanel>
        ) : selected ? (
          <RegionDetailPanel
            key={selected.id}
            region={selected}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            onSelectGenre={(genre) => { setCollapsed(false); update({ genre }); }}
            onZoomTo={(region) => flyTo(region.id)}
            onClose={() => update({ region: null, genre: null })}
          />
        ) : null}
      </div>
    </div>
  );
}
