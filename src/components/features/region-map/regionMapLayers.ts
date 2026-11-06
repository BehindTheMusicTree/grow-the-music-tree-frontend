import { interpolateYlGnBu, scaleSequentialSqrt } from "d3";
import type { ExpressionSpecification, FilterSpecification, LngLatBoundsLike, StyleSpecification } from "maplibre-gl";
import { labelHalo } from "@behindthemusictree/ui";
import { WORLD_ID, type Region } from "@schemas/api/region-map";

export const EMPTY_FILL = "#e5e7eb";
export const MAX_ZOOM = 11;

export const TILES_SOURCE = "tiles";
export const REGION_FILL_LAYER = "region-fill";
export const REGION_LINE_LAYER = "region-line";
export const REGION_LABEL_LAYER = "region-labels";
export const ZONE_FILL_LAYER = "zone-fill";
export const ZONE_LINE_LAYER = "zone-line";
export const REGIONS_SOURCE_LAYER = "regions";
export const CITY_LAYER = "city-points";
export const CITIES_SOURCE_LAYER = "cities";
/** The tileset's last zoom: MapLibre overzooms it up to MAX_ZOOM. */
export const TILESET_MAX_ZOOM = 10;
const FONT = ["Noto Sans Regular"];

const OCEAN = "#dbeafe";
// Latitudes beyond these hold no region worth framing (Antarctica is not part of the map).
const WORLD_BOUNDS: LngLatBoundsLike = [
  [-180, -58],
  [180, 84],
];

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

const union = (boxes: readonly Region["mainBbox"][]): Region["mainBbox"] => [
  Math.min(...boxes.map((box) => box[0])),
  Math.min(...boxes.map((box) => box[1])),
  Math.max(...boxes.map((box) => box[2])),
  Math.max(...boxes.map((box) => box[3])),
];

export function levelBounds(levelId: string, regions: ReadonlyMap<string, Region>): LngLatBoundsLike {
  const region = levelId === WORLD_ID ? undefined : regions.get(levelId);
  if (!region) return WORLD_BOUNDS;
  // A zone's own box spans the antimeridian through its overseas members, so frame the members instead.
  const members = region.kind === "zone" ? region.childIds.flatMap((id) => {
        const box = regions.get(id)?.mainBbox;
        return box ? [box] : [];
      }) : [];
  const [west, south, east, north] = members.length > 0 ? union(members) : region.mainBbox;
  return [
    [west, south],
    [east, north],
  ];
}

/** The regions drawn at a level. */
export const levelRegions = (regions: ReadonlyMap<string, Region>, childIds: readonly string[]): Region[] =>
  childIds.flatMap((id) => regions.get(id) ?? []);

const featureState = (key: "selected" | "hover"): ExpressionSpecification => ["boolean", ["feature-state", key], false];

export const levelFilter = (childIds: readonly string[]): FilterSpecification => [
  "in",
  ["get", "id"],
  ["literal", [...childIds]],
];

/** The cities of the level itself and of the regions drawn on it; the tileset carries each city's admin `parentId`. */
export const cityFilter = (levelId: string, childIds: readonly string[]): FilterSpecification => [
  "in",
  ["get", "parentId"],
  ["literal", [levelId, ...childIds]],
];

/** A zone id is never empty, so this matches no zone while none is chosen. */
export const zoneFilter = (zoneId: string | null): FilterSpecification => ["==", ["get", "id"], zoneId ?? ""];

/** Natural Earth's `min_zoom` says from which zoom a feature is worth drawing. */
const byMinZoom: FilterSpecification = ["<=", ["get", "min_zoom"], ["zoom"]];

const PLACE_LABEL_SIZE = 11;
const PLACE_LABEL_COLOR = "#374151";
const REGION_LABEL_SIZE = 13;
const REGION_LABEL_COLOR = "#111827";

function textPaint(color: string, size: number) {
  const halo = labelHalo(color, size);
  return { "text-color": color, "text-halo-color": halo.color, "text-halo-width": halo.width };
}

type StyleOptions = {
  tilesetUrl: string;
  glyphsUrl: string;
  levelId: string;
  childIds: readonly string[];
  zoneId: string | null;
  colors: ReadonlyMap<string, string>;
};

export function buildStyle({ tilesetUrl, glyphsUrl, levelId, childIds, zoneId, colors }: StyleOptions): StyleSpecification {
  return {
    version: 8,
    projection: { type: "globe" },
    sky: {
      "sky-color": "#bfdbfe",
      "horizon-color": "#e0f2fe",
      "sky-horizon-blend": 0.6,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
    },
    glyphs: glyphsUrl,
    sources: {
      [TILES_SOURCE]: {
        type: "vector",
        url: `pmtiles://${tilesetUrl}`,
        maxzoom: TILESET_MAX_ZOOM,
        promoteId: { [REGIONS_SOURCE_LAYER]: "id", zones: "id", [CITIES_SOURCE_LAYER]: "id" },
      },
    },
    layers: [
      { id: "ocean", type: "background", paint: { "background-color": OCEAN } },
      { id: "land", type: "fill", source: TILES_SOURCE, "source-layer": "land", paint: { "fill-color": EMPTY_FILL } },
      { id: "lakes", type: "fill", source: TILES_SOURCE, "source-layer": "lakes", paint: { "fill-color": OCEAN } },
      {
        id: REGION_FILL_LAYER,
        type: "fill",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: levelFilter(childIds),
        paint: { "fill-color": fillColorExpression(colors) },
      },
      {
        id: "rivers",
        type: "line",
        source: TILES_SOURCE,
        "source-layer": "rivers",
        filter: byMinZoom,
        paint: { "line-color": "#93c5fd", "line-width": 0.8 },
      },
      {
        id: REGION_LINE_LAYER,
        type: "line",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: levelFilter(childIds),
        paint: {
          "line-color": ["case", featureState("selected"), "#111827", featureState("hover"), "#374151", "#ffffff"],
          "line-width": ["case", featureState("selected"), 2, featureState("hover"), 1.5, 0.5],
        },
      },
      {
        id: "disputed",
        type: "line",
        source: TILES_SOURCE,
        "source-layer": "disputed",
        paint: { "line-color": "#6b7280", "line-width": 1, "line-dasharray": [2, 2] },
      },
      {
        id: ZONE_FILL_LAYER,
        type: "fill",
        source: TILES_SOURCE,
        "source-layer": "zones",
        filter: zoneFilter(zoneId),
        paint: { "fill-color": "#f97316", "fill-opacity": 0.15 },
      },
      {
        id: ZONE_LINE_LAYER,
        type: "line",
        source: TILES_SOURCE,
        "source-layer": "zones",
        filter: zoneFilter(zoneId),
        paint: { "line-color": "#c2410c", "line-width": 1.5, "line-dasharray": [4, 3] },
      },
      {
        id: "places",
        type: "circle",
        source: TILES_SOURCE,
        "source-layer": "places",
        filter: byMinZoom,
        paint: {
          "circle-radius": 2.5,
          "circle-color": "#374151",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      },
      {
        id: CITY_LAYER,
        type: "circle",
        source: TILES_SOURCE,
        "source-layer": CITIES_SOURCE_LAYER,
        filter: cityFilter(levelId, childIds),
        paint: {
          "circle-radius": ["case", featureState("selected"), 7, featureState("hover"), 6, 4.5],
          "circle-color": ["case", featureState("selected"), "#111827", "#f97316"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      },
      {
        id: "place-labels",
        type: "symbol",
        source: TILES_SOURCE,
        "source-layer": "places",
        filter: byMinZoom,
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT,
          "text-size": PLACE_LABEL_SIZE,
          "text-anchor": "top",
          "text-offset": [0, 0.5],
        },
        paint: textPaint(PLACE_LABEL_COLOR, PLACE_LABEL_SIZE),
      },
      {
        id: REGION_LABEL_LAYER,
        type: "symbol",
        source: TILES_SOURCE,
        "source-layer": "region_labels",
        filter: levelFilter(childIds),
        layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": REGION_LABEL_SIZE },
        paint: textPaint(REGION_LABEL_COLOR, REGION_LABEL_SIZE),
      },
    ],
  };
}
