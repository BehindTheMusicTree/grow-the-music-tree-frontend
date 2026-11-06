import { describe, expect, it } from "vitest";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, type Region } from "@schemas/api/region-map";
import {
  ancestry,
  buildStyle,
  cityRadius,
  depthColors,
  depthOf,
  describe as describeRegion,
  EMPTY_FILL,
  fillColorExpression,
  idFilter,
  inBand,
  regionBounds,
  WORLD_BOUNDS,
  zoneLineFilter,
} from "./regionMapLayers";

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));
const france = regions.get("Q142")!;
const brittany = regions.get("Q12130")!;

describe("depthOf", () => {
  it("counts the steps from the world", () => {
    expect(depthOf(france, regions)).toBe(0);
    expect(depthOf(brittany, regions)).toBe(1);
  });

  it("fails on a parent missing from the index", () => {
    expect(() => depthOf({ ...brittany, parentId: "missing" }, regions)).toThrow();
  });
});

describe("depthColors", () => {
  it("compares regions with their peers of the same depth and greys out those without songs", () => {
    const colors = depthColors(regions);

    expect(colors.get("Q183")).toBe(EMPTY_FILL);
    // Brittany tops its own depth even though France has more songs.
    expect(colors.get("Q12130")).toBe(colors.get("Q142"));
    expect(colors.get("Q142")).toMatch(/^rgb\(/);
  });

  it("tints a region without songs when one of its zones has some", () => {
    const zone = regions.get("Q236626")!;
    const covered = new Map(regions)
      .set(zone.id, { ...zone, songCount: 10 })
      .set("Q183", { ...regions.get("Q183")!, songCount: 0, zoneIds: [zone.id] });

    expect(depthColors(covered).get("Q183")).toMatch(/^rgb\(/);
    expect(depthColors(regions).get("Q183")).toBe(EMPTY_FILL);
  });

  it("leaves zones out", () => {
    expect(depthColors(regions).has("Q236626")).toBe(false);
  });
});

describe("regionBounds", () => {
  it("frames the whole world without a region", () => {
    expect(regionBounds(undefined, regions)).toEqual(WORLD_BOUNDS);
  });

  it("frames a region by its main bbox", () => {
    const [west, south, east, north] = france.mainBbox;

    expect(regionBounds(france, regions)).toEqual([
      [west, south],
      [east, north],
    ]);
  });

  it("frames a zone by the union of its members", () => {
    const zone: Region = { ...regions.get("Q236626")!, childIds: ["Q142", "Q183"], mainBbox: [-180, -90, 180, 90] };
    const germany: Region = { ...regions.get("Q183")!, mainBbox: [6, 47, 15, 55] };
    const withMembers = new Map(regions).set("Q183", germany);

    expect(regionBounds(zone, withMembers)).toEqual([
      [-5, 42],
      [15, 55],
    ]);
  });
});

describe("ancestry", () => {
  it("lists the ancestors outermost first, without the world", () => {
    expect(ancestry(brittany, regions).map((region) => region.id)).toEqual(["Q142", "Q12130"]);
    expect(ancestry(france, regions).map((region) => region.id)).toEqual(["Q142"]);
  });
});

describe("fillColorExpression", () => {
  it("falls back to the empty fill when nothing is coloured", () => {
    expect(fillColorExpression(new Map())).toBe(EMPTY_FILL);
  });

  it("matches region ids to colours", () => {
    expect(fillColorExpression(new Map([["Q142", "#123456"]]))).toEqual([
      "match",
      ["get", "id"],
      "Q142",
      "#123456",
      EMPTY_FILL,
    ]);
  });
});

describe("describeRegion", () => {
  it("states the name and the counts", () => {
    expect(describeRegion(france)).toBe(`France · ${france.songCount} songs · ${france.genreCount} genres`);
  });
});

describe("buildStyle", () => {
  const style = (overrides: Partial<Parameters<typeof buildStyle>[0]> = {}) =>
    buildStyle({
      tilesetUrl: "https://tiles.example.com/regions/abc.pmtiles",
      glyphsUrl: "https://tiles.example.com/fonts/{fontstack}/{range}.pbf",
      zoneId: null,
      selectedId: null,
      colors: new Map([["Q12130", "#123456"]]),
      ...overrides,
    });
  const layer = (id: string, built = style()) =>
    built.layers.find((candidate) => candidate.id === id) as { filter?: unknown; paint?: unknown; layout?: unknown };

  it("is a globe with an atmosphere, fed by one pmtiles vector source", () => {
    const built = style();

    expect(built.projection).toEqual({ type: "globe" });
    expect(built.sky).toBeDefined();
    expect(built.glyphs).toBe("https://tiles.example.com/fonts/{fontstack}/{range}.pbf");
    expect(built.sources).toEqual({
      tiles: {
        type: "vector",
        url: "pmtiles://https://tiles.example.com/regions/abc.pmtiles",
        maxzoom: 10,
        promoteId: { regions: "id", zones: "id" },
      },
    });
  });

  it("stacks the layers from the ocean up to the labels", () => {
    expect(style().layers.map((candidate) => candidate.id)).toEqual([
      "ocean",
      "land",
      "lakes",
      "region-hit",
      "region-fill",
      "rivers",
      "region-line",
      "disputed",
      "zone-fill",
      "zone-line",
      "region-selected-line",
      "places",
      "place-labels",
      "cities",
      "city-labels",
      "zone-labels",
      "region-labels",
    ]);
  });

  it("fills and labels a region inside its zoom band, with its colour", () => {
    expect(layer("region-fill").filter).toEqual(inBand);
    expect(layer("region-labels").filter).toEqual(inBand);
    expect(layer("zone-labels").filter).toEqual(inBand);
    expect(layer("region-fill").paint).toMatchObject({
      "fill-color": ["match", ["get", "id"], "Q12130", "#123456", EMPTY_FILL],
    });
  });

  it("keeps borders and click targets from a region's min_zoom on", () => {
    const byMinZoom = ["<=", ["get", "min_zoom"], ["zoom"]];

    expect(layer("region-line").filter).toEqual(byMinZoom);
    expect(layer("region-hit").filter).toEqual(byMinZoom);
    expect(layer("cities").filter).toEqual(byMinZoom);
  });

  it("outlines the selection at any zoom", () => {
    expect(layer("region-selected-line").filter).toEqual(idFilter(null));
    expect(layer("region-selected-line", style({ selectedId: "Q142" })).filter).toEqual(["==", ["get", "id"], "Q142"]);
    expect(layer("cities", style({ selectedId: "Q90" })).paint).toMatchObject({ "circle-radius": cityRadius("Q90") });
  });

  it("fills only the chosen zone and keeps it outlined out of its band", () => {
    expect(layer("zone-fill").filter).toEqual(["==", ["get", "id"], ""]);
    expect(layer("zone-fill", style({ zoneId: "Q236626" })).filter).toEqual(["==", ["get", "id"], "Q236626"]);
    expect(layer("zone-line", style({ zoneId: "Q236626" })).filter).toEqual(zoneLineFilter("Q236626"));
  });

  it("reveals cities and rivers from their Natural Earth min_zoom", () => {
    const byMinZoom = ["<=", ["get", "min_zoom"], ["zoom"]];

    expect(layer("places").filter).toEqual(byMinZoom);
    expect(layer("place-labels").filter).toEqual(byMinZoom);
    expect(layer("rivers").filter).toEqual(byMinZoom);
  });
});

describe("inBand", () => {
  it("draws a feature from its min_zoom up to, not including, its max_zoom, or forever without one", () => {
    expect(inBand).toEqual([
      "all",
      ["<=", ["get", "min_zoom"], ["zoom"]],
      ["any", ["!", ["has", "max_zoom"]], ["<", ["zoom"], ["get", "max_zoom"]]],
    ]);
  });
});
