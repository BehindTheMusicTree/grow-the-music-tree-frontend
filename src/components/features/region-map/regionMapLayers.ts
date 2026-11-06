import { interpolateYlGnBu, scaleSequentialSqrt } from "d3";
import type { ExpressionSpecification, LngLatBoundsLike, StyleSpecification } from "maplibre-gl";
import { labelHalo } from "@behindthemusictree/ui";
import { WORLD_ID, type Region } from "@schemas/api/region-map";

export const EMPTY_FILL = "#e5e7eb";
export const MAX_ZOOM = 11;

export const TILES_SOURCE = "tiles";
export const REGION_HIT_LAYER = "region-hit";
export const REGION_FILL_LAYER = "region-fill";
export const REGION_LINE_LAYER = "region-line";
export const REGION_SELECTED_LAYER = "region-selected-line";
export const REGION_LABEL_LAYER = "region-labels";
export const ZONE_FILL_LAYER = "zone-fill";
export const ZONE_LINE_LAYER = "zone-line";
export const ZONE_LABEL_LAYER = "zone-labels";
export const CITY_LAYER = "cities";
export const CITY_LABEL_LAYER = "city-labels";
export const REGIONS_SOURCE_LAYER = "regions";
/** The tileset's last zoom: MapLibre overzooms it up to MAX_ZOOM. */
export const TILESET_MAX_ZOOM = 10;
const FONT = ["Noto Sans Regular"];

const OCEAN = "#dbeafe";
// Latitudes beyond these hold no region worth framing (Antarctica is not part of the map).
export const WORLD_BOUNDS: LngLatBoundsLike = [
  [-180, -58],
  [180, 84],
];

export const describe = (region: Region) => `${region.name} · ${region.songCount} songs · ${region.genreCount} genres`;

const isAdmin = (region: Region) => region.kind === "country" || region.kind === "admin_unit";

/** Distance of an admin region below the world: 0 for a country, 1 for its subdivisions… */
export function depthOf(region: Region, regions: ReadonlyMap<string, Region>): number {
  let depth = 0;
  for (let parent = region.parentId; parent !== null && parent !== WORLD_ID; depth++) {
    const next = regions.get(parent);
    if (!next) throw new Error(`region ${region.id} has an unknown ancestor ${parent}`);
    parent = next.parentId;
  }
  return depth;
}

/**
 * Square-root scale over the songs of the admin regions of the same depth: countries are compared with countries and
 * subdivisions with subdivisions worldwide, so a country's rolled-up total does not flatten its own subdivisions.
 */
export function depthColors(regions: ReadonlyMap<string, Region>): Map<string, string> {
  const byDepth = new Map<number, Region[]>();
  for (const region of Array.from(regions.values())) {
    if (!isAdmin(region)) continue;
    const depth = depthOf(region, regions);
    byDepth.set(depth, [...(byDepth.get(depth) ?? []), region]);
  }
  const colors = new Map<string, string>();
  for (const peers of Array.from(byDepth.values())) {
    const max = Math.max(1, ...peers.map((region) => region.songCount));
    const scale = scaleSequentialSqrt(interpolateYlGnBu).domain([0, max]);
    for (const region of peers) colors.set(region.id, region.songCount > 0 ? scale(region.songCount) : EMPTY_FILL);
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

export function regionBounds(region: Region | undefined, regions: ReadonlyMap<string, Region>): LngLatBoundsLike {
  if (!region) return WORLD_BOUNDS;
  // A zone's own box spans the antimeridian through its overseas members, so frame the members instead.
  const members =
    region.kind === "zone"
      ? region.childIds.flatMap((id) => {
          const box = regions.get(id)?.mainBbox;
          return box ? [box] : [];
        })
      : [];
  const [west, south, east, north] = members.length > 0 ? union(members) : region.mainBbox;
  return [
    [west, south],
    [east, north],
  ];
}

/** The region and its ancestors up to the world, outermost first. */
export function ancestry(region: Region, regions: ReadonlyMap<string, Region>): Region[] {
  const chain = [region];
  for (let parent = region.parentId; parent !== null && parent !== WORLD_ID; ) {
    const next = regions.get(parent);
    if (!next) break;
    chain.unshift(next);
    parent = next.parentId;
  }
  return chain;
}

const hovered: ExpressionSpecification = ["boolean", ["feature-state", "hover"], false];

export const cityRadius = (selectedId: string | null): ExpressionSpecification => [
  "case",
  ["==", ["get", "id"], selectedId ?? ""],
  6,
  4,
];

/** A feature id is never empty, so this matches nothing while no id is given. */
export const idFilter = (id: string | null): ExpressionSpecification => ["==", ["get", "id"], id ?? ""];

/** From which zoom a feature is worth drawing: the tileset's `min_zoom`. */
const byMinZoom: ExpressionSpecification = ["<=", ["get", "min_zoom"], ["zoom"]];

/**
 * A feature's zoom band `[min_zoom, max_zoom)` from the tileset, `max_zoom` absent when the band is open: a region
 * gives way to its subdivisions as the map zooms in, and comes back as it zooms out.
 */
export const inBand: ExpressionSpecification = [
  "all",
  byMinZoom,
  ["any", ["!", ["has", "max_zoom"]], ["<", ["zoom"], ["get", "max_zoom"]]],
];

/** Zones are outlined inside their band; the selected zone stays outlined at any zoom. */
export const zoneLineFilter = (zoneId: string | null): ExpressionSpecification => ["any", inBand, idFilter(zoneId)];

const depth: ExpressionSpecification = ["get", "depth"];

const PLACE_LABEL_SIZE = 11;
const PLACE_LABEL_COLOR = "#374151";
const REGION_LABEL_COLOR = "#111827";
const ZONE_COLOR = "#c2410c";
const CITY_COLOR = "#7c3aed";

function textPaint(color: string, size: number) {
  const halo = labelHalo(color, size);
  return { "text-color": color, "text-halo-color": halo.color, "text-halo-width": halo.width };
}

type StyleOptions = {
  tilesetUrl: string;
  glyphsUrl: string;
  zoneId: string | null;
  selectedId: string | null;
  colors: ReadonlyMap<string, string>;
};

export function buildStyle({ tilesetUrl, glyphsUrl, zoneId, selectedId, colors }: StyleOptions): StyleSpecification {
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
        promoteId: { [REGIONS_SOURCE_LAYER]: "id", zones: "id" },
      },
    },
    layers: [
      { id: "ocean", type: "background", paint: { "background-color": OCEAN } },
      { id: "land", type: "fill", source: TILES_SOURCE, "source-layer": "land", paint: { "fill-color": EMPTY_FILL } },
      { id: "lakes", type: "fill", source: TILES_SOURCE, "source-layer": "lakes", paint: { "fill-color": OCEAN } },
      {
        // A split region stays clickable in the gaps its genre-less subdivisions leave.
        id: REGION_HIT_LAYER,
        type: "fill",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: byMinZoom,
        paint: { "fill-color": EMPTY_FILL, "fill-opacity": 0 },
      },
      {
        id: REGION_FILL_LAYER,
        type: "fill",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: inBand,
        layout: { "fill-sort-key": depth },
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
        // Borders outlive their band, so a country's outline stays under its subdivisions.
        id: REGION_LINE_LAYER,
        type: "line",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: byMinZoom,
        layout: { "line-sort-key": ["-", 0, depth] },
        paint: {
          "line-color": [
            "case",
            hovered,
            "#111827",
            ["==", depth, 0],
            "#1f2937",
            "#f9fafb",
          ],
          "line-width": [
            "case",
            hovered,
            1.5,
            ["==", depth, 0],
            1.2,
            0.5,
          ],
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
        filter: idFilter(zoneId),
        paint: { "fill-color": "#f97316", "fill-opacity": 0.15 },
      },
      {
        id: ZONE_LINE_LAYER,
        type: "line",
        source: TILES_SOURCE,
        "source-layer": "zones",
        filter: zoneLineFilter(zoneId),
        paint: { "line-color": ZONE_COLOR, "line-width": 1.5, "line-dasharray": [4, 3] },
      },
      {
        // No zoom filter: the selection stays outlined once the map zooms past its band.
        id: REGION_SELECTED_LAYER,
        type: "line",
        source: TILES_SOURCE,
        "source-layer": REGIONS_SOURCE_LAYER,
        filter: idFilter(selectedId),
        paint: { "line-color": "#111827", "line-width": 2 },
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
        id: CITY_LAYER,
        type: "circle",
        source: TILES_SOURCE,
        "source-layer": "cities",
        filter: byMinZoom,
        paint: {
          "circle-radius": cityRadius(selectedId),
          "circle-color": CITY_COLOR,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      },
      {
        id: CITY_LABEL_LAYER,
        type: "symbol",
        source: TILES_SOURCE,
        "source-layer": "cities",
        filter: byMinZoom,
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT,
          "text-size": 12,
          "text-anchor": "top",
          "text-offset": [0, 0.6],
        },
        paint: textPaint(CITY_COLOR, 12),
      },
      {
        id: ZONE_LABEL_LAYER,
        type: "symbol",
        source: TILES_SOURCE,
        "source-layer": "zone_labels",
        filter: inBand,
        layout: { "text-field": ["get", "name"], "text-font": FONT, "text-size": 13, "text-letter-spacing": 0.05 },
        paint: textPaint(ZONE_COLOR, 13),
      },
      {
        id: REGION_LABEL_LAYER,
        type: "symbol",
        source: TILES_SOURCE,
        "source-layer": "region_labels",
        filter: inBand,
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT,
          "text-size": ["case", ["==", depth, 0], 14, 12],
          "symbol-sort-key": depth,
        },
        paint: textPaint(REGION_LABEL_COLOR, 13),
      },
    ],
  };
}
