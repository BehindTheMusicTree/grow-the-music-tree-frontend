"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRegionMapFile, useRegionMapIndex } from "@hooks/useRegionMap";
import { WORLD_ID, type Region } from "@schemas/api/region-map";

const RegionMapChart = dynamic(() => import("./RegionMapChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" />,
});

const Skeleton = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-200" aria-busy />;

export default function RegionMapView() {
  const { data: index, isPending, isError } = useRegionMapIndex();
  const [trail, setTrail] = useState<string[]>([WORLD_ID]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const regions = useMemo(() => new Map((index?.regions ?? []).map((region) => [region.id, region])), [index]);

  const levelId = trail[trail.length - 1];
  const level = useRegionMapFile(index?.files[`geometry/${levelId}.geojson`]);
  const zone = useRegionMapFile(zoneId === null ? undefined : index?.files[`zones/${zoneId}.geojson`]);

  if (isPending) return <Skeleton />;
  if (isError) return <p className="text-red-600">Could not load the region map.</p>;
  if (index === null) return <p className="text-gray-700">The region map has not been computed yet.</p>;

  const goTo = (depth: number) => {
    setTrail(trail.slice(0, depth + 1));
    setSelectedId(null);
    setZoneId(null);
  };
  const onRegionClick = (region: Region) => {
    if (region.drillable) {
      setTrail([...trail, region.id]);
      setSelectedId(null);
      setZoneId(null);
    } else {
      setSelectedId(region.id);
    }
  };
  const levelRegion = regions.get(levelId);
  const selected = selectedId === null ? undefined : regions.get(selectedId);
  const zones = (levelRegion?.zoneIds ?? []).flatMap((id) => regions.get(id) ?? []);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Region path" className="flex flex-wrap items-center gap-1 text-sm">
          {trail.map((id, depth) => (
            <span key={id} className="flex items-center gap-1">
              {depth > 0 && <span aria-hidden>›</span>}
              <button
                type="button"
                onClick={() => goTo(depth)}
                disabled={depth === trail.length - 1}
                className="rounded px-1 font-semibold hover:underline disabled:no-underline"
              >
                {id === WORLD_ID ? "World" : (regions.get(id)?.name ?? id)}
              </button>
            </span>
          ))}
        </nav>
        {zones.length > 0 && (
          <label className="flex items-center gap-2 text-sm">
            Zone
            <select
              value={zoneId ?? ""}
              onChange={(event) => setZoneId(event.target.value || null)}
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
        {zone.isError && (
          <p className="text-sm text-red-600" role="alert">
            Could not load this zone.
          </p>
        )}
        {selected && (
          <p className="text-sm" aria-live="polite">
            <span className="font-semibold">{selected.name}</span>: {selected.songCount} songs, {selected.genreCount}{" "}
            genres
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {level.isError ? (
          <p className="text-red-600">Could not load this level of the map.</p>
        ) : level.data === undefined ? (
          <Skeleton />
        ) : (
          <RegionMapChart
            key={levelId}
            level={level.data}
            zone={zone.data}
            regions={regions}
            selectedId={selectedId}
            onRegionClick={onRegionClick}
          />
        )}
      </div>
    </div>
  );
}
