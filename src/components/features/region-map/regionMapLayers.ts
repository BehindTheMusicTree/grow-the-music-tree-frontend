import { interpolateYlGnBu, scaleSequentialSqrt } from "d3";
import type { ExpressionSpecification, LngLatBoundsLike, StyleSpecification } from "maplibre-gl";
import { WORLD_ID, type Region } from "@schemas/api/region-map";

export const EMPTY_FILL = "#e5e7eb";
export const MAX_ZOOM = 11;

export const LEVEL_SOURCE = "level";
export const ZONE_SOURCE = "zone";
export const REGION_FILL_LAYER = "region-fill";
export const REGION_LINE_LAYER = "region-line";

const OCEAN = "#dbeafe";
// Latitudes beyond these hold no region worth framing (Antarctica is not part of the map).
const WORLD_BOUNDS: LngLatBoundsLike = [
  [-180, -58],
  [180, 84],
];

export const EMPTY_COLLECTION: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export const describe = (region: Region) => `${region.name} · ${region.songCount} songs · ${region.genreCount} genres`;

/** Square-root scale over the songs of the regions shown together, so one outlier does not flatten the others. */
export function regionColors(ids: readonly string[], regions: ReadonlyMap<string, Region>): Map<string, string> {
  const max = Math.max(1, ...ids.map((id) => regions.get(id)?.songCount ?? 0));
  const scale = scaleSequentialSqrt(interpolateYlGnBu).domain([0, max]);
  const colors = new Map<string, string>();
  for (const id of ids) {
    const region = regions.get(id);
    if (region) colors.set(id, region.songCount > 0 ? scale(region.songCount) : EMPTY_FILL);
  }
  return colors;
}

export function fillColorExpression(colors: ReadonlyMap<string, string>): string | ExpressionSpecification {
  if (colors.size === 0) return EMPTY_FILL;
  return ["match", ["get", "id"], ...Array.from(colors).flat(), EMPTY_FILL] as unknown as ExpressionSpecification;
}

export function levelBounds(levelId: string, regions: ReadonlyMap<string, Region>): LngLatBoundsLike {
  const region = levelId === WORLD_ID ? undefined : regions.get(levelId);
  if (!region) return WORLD_BOUNDS;
  const [west, south, east, north] = region.mainBbox;
  return [
    [west, south],
    [east, north],
  ];
}

const featureState = (key: "selected" | "hover"): ExpressionSpecification => ["boolean", ["feature-state", key], false];

export function buildStyle(): StyleSpecification {
  return {
    version: 8,
    projection: { type: "globe" },
    sky: {
      "sky-color": "#bfdbfe",
      "horizon-color": "#e0f2fe",
      "sky-horizon-blend": 0.6,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
    },
    sources: {
      [LEVEL_SOURCE]: { type: "geojson", data: EMPTY_COLLECTION, promoteId: "id" },
      [ZONE_SOURCE]: { type: "geojson", data: EMPTY_COLLECTION },
    },
    layers: [
      { id: "ocean", type: "background", paint: { "background-color": OCEAN } },
      { id: REGION_FILL_LAYER, type: "fill", source: LEVEL_SOURCE, paint: { "fill-color": EMPTY_FILL } },
      {
        id: REGION_LINE_LAYER,
        type: "line",
        source: LEVEL_SOURCE,
        paint: {
          "line-color": ["case", featureState("selected"), "#111827", featureState("hover"), "#374151", "#ffffff"],
          "line-width": ["case", featureState("selected"), 2, featureState("hover"), 1.5, 0.5],
        },
      },
      { id: "zone-fill", type: "fill", source: ZONE_SOURCE, paint: { "fill-color": "#f97316", "fill-opacity": 0.15 } },
      {
        id: "zone-line",
        type: "line",
        source: ZONE_SOURCE,
        paint: { "line-color": "#c2410c", "line-width": 1.5, "line-dasharray": [4, 3] },
      },
    ],
  };
}
