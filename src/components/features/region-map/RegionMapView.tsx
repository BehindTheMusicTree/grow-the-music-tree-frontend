"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@behindthemusictree/ui";
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

  const [collapsed, setCollapsed] = useState(false);
  const selectedId = state.region;
  useEffect(() => {
    setCollapsed(false);
  }, [selectedId]);

  const urlZoneId = level && state.region !== null && level.zoneIds.includes(state.region) ? state.region : null;
  useEffect(() => {
    if (urlZoneId !== null) setZoneId(urlZoneId);
  }, [urlZoneId]);

  const invalidPath = index != null && path.length !== state.path.length;
  const invalidRegion = index != null && state.region !== null && selected === undefined;
  useEffect(() => {
    if (invalidPath) update({ path }, "replace");
    else if (invalidRegion) update({ region: null, genre: null }, "replace");
  }, [invalidPath, invalidRegion, path, update]);

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
  const current = regions.get(levelId);

  return (
    <div className="flex h-full flex-col gap-3">
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
        {path.length > 0 && (
          <Breadcrumb
            className="absolute left-1/2 top-3 z-10 max-w-[calc(100%-theme(spacing.6))] -translate-x-1/2"
            home={{ label: "World", onSelect: () => goTo(0) }}
            items={path.map((id) => ({ id, label: regions.get(id)?.name ?? id }))}
            onSelect={(id) => goTo(path.indexOf(id) + 1)}
            onSelectCurrent={current && (() => select(current))}
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
            onFocus={focus}
            onClose={() => update({ region: null, genre: null })}
          />
        )}
      </div>
    </div>
  );
}
