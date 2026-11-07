"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@behindthemusictree/ui";
import { useRegionMapIndex } from "@hooks/useRegionMap";
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
  const regions = useMemo(() => new Map(index.regions.map((region) => [region.id, region])), [index]);
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
  const flyTo = useCallback((id: string | null) => {
    if (id !== null && regions.get(id)?.boundaryStatus === "missing") return;
    setFocus((current) => ({ id, seq: (current?.seq ?? 0) + 1 }));
  }, [regions]);
  const missingBoundaries = index.regions
    .filter((region) => region.boundaryStatus === "missing")
    .sort((a, b) => a.name.localeCompare(b.name));

  const [collapsed, setCollapsed] = useState(false);
  const selectedId = state.region;
  useEffect(() => {
    setCollapsed(false);
  }, [selectedId]);

  const hasLegacyPath = state.legacyPath.length > 0;
  const invalidRegion = state.region !== null && selected === undefined;
  useEffect(() => {
    if (hasLegacyPath || invalidRegion) {
      update({ legacyPath: null, ...(invalidRegion ? { region: null, genre: null } : {}) }, "replace");
    }
  }, [hasLegacyPath, invalidRegion, update]);

  // Panning is not navigation: the camera replaces the history entry instead of adding one.
  const onCameraChange = useCallback((at: Camera) => update({ at }, "replace"), [update]);

  const select = (region: Region) => update({ region: region.id, genre: null });
  const clearSelection = () => {
    if (state.region !== null) update({ region: null, genre: null });
  };
  const pick = useCallback(
    (regionId: string, genre: string | null) => {
      update({ region: regionId, genre });
      flyTo(regionId);
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
        <RegionMapSearch index={index} regions={regions} onPick={pick} className="absolute left-3 right-3 top-3 z-20 sm:right-auto sm:w-80" />
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
              update({ region: id, genre: null });
              flyTo(id);
            }}
            onSelectCurrent={() => flyTo(selected.id)}
          />
        )}
        {selected && (
          <RegionDetailPanel
            key={selected.id}
            region={selected}
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            genreUuid={state.genre}
            onSelectGenre={(genre) => update({ genre })}
            onZoomTo={(region) => flyTo(region.id)}
            onClose={() => update({ region: null, genre: null })}
          />
        )}
      </div>
    </div>
  );
}
