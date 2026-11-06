import { describe, expect, it } from "vitest";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, WORLD_ID } from "@schemas/api/region-map";
import {
  buildStyle,
  describe as describeRegion,
  EMPTY_FILL,
  fillColorExpression,
  levelBounds,
  levelRegions,
  regionColors,
} from "./regionMapLayers";

const index = RegionMapIndexSchema.parse(fixture);
const regions = new Map(index.regions.map((region) => [region.id, region]));

describe("regionColors", () => {
  it("greys out a region without songs and colours the others", () => {
    const colors = regionColors(["Q142", "Q183"], regions);

    expect(colors.get("Q183")).toBe(EMPTY_FILL);
    expect(colors.get("Q142")).toMatch(/^rgb\(/);
  });

  it("skips ids that are not in the index", () => {
    expect(regionColors(["missing"], regions).size).toBe(0);
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

describe("levelBounds", () => {
  it("frames the whole world at the root level", () => {
    expect(levelBounds(WORLD_ID, regions)).toEqual([
      [-180, -58],
      [180, 84],
    ]);
  });

  it("frames a region by its main bbox", () => {
    const [west, south, east, north] = regions.get("Q142")!.mainBbox;

    expect(levelBounds("Q142", regions)).toEqual([
      [west, south],
      [east, north],
    ]);
  });
});

describe("describeRegion", () => {
  it("states the name and the counts", () => {
    const france = regions.get("Q142")!;

    expect(describeRegion(france)).toBe(`France · ${france.songCount} songs · ${france.genreCount} genres`);
  });
});

describe("buildStyle", () => {
  const style = (overrides: Partial<Parameters<typeof buildStyle>[0]> = {}) =>
    buildStyle({
      tilesetUrl: "https://tiles.example.com/regions/abc.pmtiles",
      glyphsUrl: "https://tiles.example.com/fonts/{fontstack}/{range}.pbf",
      levelId: "Q142",
      childIds: ["Q12130"],
      zoneId: null,
      colors: new Map([["Q12130", "#123456"]]),
      ...overrides,
    });
  const layer = (id: string) => style().layers.find((candidate) => candidate.id === id) as { filter?: unknown };

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
        promoteId: { regions: "id", zones: "id", cities: "id" },
      },
    });
  });

  it("stacks the layers from the ocean up to the labels", () => {
    expect(style().layers.map((candidate) => candidate.id)).toEqual([
      "ocean",
      "land",
      "lakes",
      "region-fill",
      "rivers",
      "region-line",
      "disputed",
      "zone-fill",
      "zone-line",
      "places",
      "city-points",
      "place-labels",
      "region-labels",
    ]);
  });

  it("shows only the children of the level, with their colours", () => {
    expect(layer("region-fill").filter).toEqual(["in", ["get", "id"], ["literal", ["Q12130"]]]);
    expect(layer("region-line").filter).toEqual(["in", ["get", "id"], ["literal", ["Q12130"]]]);
    expect(layer("region-labels").filter).toEqual(["in", ["get", "id"], ["literal", ["Q12130"]]]);
    expect(style().layers.find((candidate) => candidate.id === "region-fill")).toMatchObject({
      paint: { "fill-color": ["match", ["get", "id"], "Q12130", "#123456", EMPTY_FILL] },
    });
  });

  it("shows the cities of the level and of the regions drawn on it", () => {
    expect(layer("city-points").filter).toEqual(["in", ["get", "parentId"], ["literal", ["Q142", "Q12130"]]]);
  });

  it("shows no zone until one is chosen", () => {
    expect(layer("zone-fill").filter).toEqual(["==", ["get", "id"], ""]);
    expect(style({ zoneId: "Q236626" }).layers.find((candidate) => candidate.id === "zone-line")).toMatchObject({
      filter: ["==", ["get", "id"], "Q236626"],
    });
  });

  it("reveals cities and rivers from their Natural Earth min_zoom", () => {
    const byMinZoom = ["<=", ["get", "min_zoom"], ["zoom"]];

    expect(layer("places").filter).toEqual(byMinZoom);
    expect(layer("place-labels").filter).toEqual(byMinZoom);
    expect(layer("rivers").filter).toEqual(byMinZoom);
  });
});

describe("levelRegions", () => {
  it("lists the children of a level", () => {
    expect(levelRegions(regions, ["Q142", "Q183"]).map((region) => region.id)).toContain("Q142");
    expect(levelRegions(regions, ["Q12130"]).map((region) => region.id)).toEqual(["Q12130"]);
  });
});
