"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLeftDetailPanelLayout } from "@behindthemusictree/app-kit-ui/genre-tree";
import { useRegionMapIndex } from "@hooks/useRegionMap";
import { WORLD_ID, type Region } from "@schemas/api/region-map";
import RegionDetailPanel from "./RegionDetailPanel";
import { levelOf, validPath } from "./regionLevels";
import { useRegionMapUrlState } from "./useRegionMapUrlState";

const RegionMapCanvas = dynamic(() => import("./RegionMapCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />,
});

const Skeleton = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" aria-busy />;

export default function RegionMapView() {
  const { data: index, isPending, isError } = useRegionMapIndex();
  const { state, update } = useRegionMapUrlState();
  const [zoneId, setZoneId] = useState<string | null>(null);
  const regions = useMemo(() => new Map((index?.regions ?? []).map((region) => [region.id, region])), [index]);

  const path = useMemo(() => (index ? validPath(index, regions, state.path) : []), [index, regions, state.path]);
  const levelId = path.length > 0 ? path[path.length - 1] : WORLD_ID;
  const level = useMemo(() => (index ? levelOf(index, regions, levelId) : null), [index, regions, levelId]);
  const selected = state.region === null ? undefined : regions.get(state.region);
  const panelOpen = selected !== undefined;

  useLeftDetailPanelLayout(panelOpen);

  const invalidPath = index != null && path.length !== state.path.length;
  const invalidRegion = index != null && state.region !== null && selected === undefined;
  useEffect(() => {
    if (invalidPath) update({ path }, "replace");
    else if (invalidRegion) update({ region: null, genre: null }, "replace");
  }, [invalidPath, invalidRegion, path, update]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") update({ region: null, genre: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, update]);

  if (isPending) return <Skeleton />;
  if (isError) return <p className="text-red-600">Could not load the region map.</p>;
  if (index === null || !level) return null;

  const goTo = (depth: number) => {
    setZoneId(null);
    update({ path: path.slice(0, depth), region: null, genre: null });
  };
  const select = (region: Region) => update({ region: region.id, genre: null });
  const focus = (region: Region) => {
    setZoneId(null);
    update({ path: path.includes(region.id) ? path : [...path, region.id], genre: null });
  };
  const onZoneChange = (id: string | null) => {
    setZoneId(id);
    if (id) update({ region: id, genre: null });
  };
  const zones = level.zoneIds.flatMap((id) => regions.get(id) ?? []);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {path.length > 0 && (
          <nav aria-label="Region path" className="flex flex-wrap items-center gap-1 text-sm">
            <button type="button" onClick={() => goTo(0)} className="rounded px-1 font-semibold hover:underline">
              World
            </button>
            {path.map((id, depth) => {
              const region = regions.get(id);
              const current = depth === path.length - 1;
              return (
                <span key={id} className="flex items-center gap-1">
                  <span aria-hidden>›</span>
                  <button
                    type="button"
                    onClick={() => (current && region ? select(region) : goTo(depth + 1))}
                    aria-current={current ? "location" : undefined}
                    className="rounded px-1 font-semibold hover:underline"
                  >
                    {region?.name ?? id}
                  </button>
                </span>
              );
            })}
          </nav>
        )}
        {zones.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            Zone
            <select
              value={zoneId ?? ""}
              onChange={(event) => onZoneChange(event.target.value || null)}
              className="rounded border-gray-300 py-0.5 text-sm"
            >
              <option value="">None</option>
              {zones.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="relative min-h-0 flex-1">
        <RegionMapCanvas
          levelId={levelId}
          childIds={level.childIds}
          tileset={index.tileset}
          zoneId={zoneId}
          regions={regions}
          selectedId={state.region}
          onRegionClick={select}
        />
        {selected && (
          <RegionDetailPanel
            key={selected.id}
            region={selected}
            genreUuid={state.genre}
            onSelectGenre={(genre) => update({ genre })}
            onFocus={focus}
            onClose={() => update({ region: null, genre: null })}
          />
        )}
      </div>
    </div>
  );
}
