"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { geoIdentity, geoPath, interpolateYlGnBu, scaleSequentialSqrt } from "d3";
import type { Region, RegionFeature, RegionFeatureCollection } from "@schemas/api/region-map";

const WIDTH = 960;
const HEIGHT = 560;
const EMPTY_FILL = "#e5e7eb";

type Tooltip = { x: number; y: number; text: string };

type Props = {
  level: RegionFeatureCollection;
  zone: RegionFeatureCollection | undefined;
  regions: ReadonlyMap<string, Region>;
  selectedId: string | null;
  onRegionClick: (region: Region) => void;
};

export default function RegionMapChart({ level, zone, regions, selectedId, onRegionClick }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Planar, not spherical: shapely output carries no guaranteed ring winding, which d3's spherical clipping needs.
  const path = useMemo(() => geoPath(geoIdentity().reflectY(true).fitSize([WIDTH, HEIGHT], level)), [level]);
  const color = useMemo(() => {
    const max = Math.max(1, ...level.features.map((feature) => regions.get(feature.id)?.songCount ?? 0));
    return scaleSequentialSqrt(interpolateYlGnBu).domain([0, max]);
  }, [level, regions]);

  const describe = (region: Region) => `${region.name} · ${region.songCount} songs · ${region.genreCount} genres`;
  const placeTooltip = (point: { clientX: number; clientY: number } | { viewBox: [number, number] }, text: string) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    if ("clientX" in point) {
      setTooltip({ x: point.clientX - box.left + 12, y: point.clientY - box.top + 12, text });
      return;
    }
    // The viewBox is fitted with the default xMidYMid meet: uniform scale, centred on the spare axis.
    const scale = Math.min(box.width / WIDTH, box.height / HEIGHT);
    const [x, y] = point.viewBox;
    setTooltip({
      x: (box.width - WIDTH * scale) / 2 + x * scale + 12,
      y: (box.height - HEIGHT * scale) / 2 + y * scale + 12,
      text,
    });
  };
  const onKeyDown = (event: KeyboardEvent, region: Region) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onRegionClick(region);
  };

  const renderRegion = (feature: RegionFeature) => {
    const region = regions.get(feature.id);
    if (!region) return null;
    return (
      <path
        key={feature.id}
        data-region={feature.id}
        d={path(feature) ?? undefined}
        fill={region.songCount > 0 ? color(region.songCount) : EMPTY_FILL}
        stroke={selectedId === feature.id ? "#111827" : "#ffffff"}
        strokeWidth={selectedId === feature.id ? 1.5 : 0.5}
        className={region.drillable ? "cursor-zoom-in" : "cursor-pointer"}
        role="button"
        tabIndex={0}
        aria-label={describe(region)}
        aria-pressed={region.drillable ? undefined : selectedId === feature.id}
        onClick={() => onRegionClick(region)}
        onKeyDown={(event) => onKeyDown(event, region)}
        onMouseMove={(event) => placeTooltip(event, describe(region))}
        onMouseLeave={() => setTooltip(null)}
        onFocus={() => placeTooltip({ viewBox: path.centroid(feature) }, describe(region))}
        onBlur={() => setTooltip(null)}
      />
    );
  };

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="group"
        aria-label="Region map"
        ref={svgRef}
      >
        <g data-layer="regions">{level.features.map(renderRegion)}</g>
        {zone && (
          <g data-layer="zone" pointerEvents="none">
            {zone.features.map((feature) => (
              <path
                key={feature.id}
                data-zone={feature.id}
                d={path(feature) ?? undefined}
                fill="#f97316"
                fillOpacity={0.15}
                stroke="#c2410c"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ))}
          </g>
        )}
      </svg>
      {tooltip && (
        <div
          aria-hidden
          data-tooltip
          className="pointer-events-none absolute rounded bg-black/80 px-2 py-1 text-sm text-white"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
