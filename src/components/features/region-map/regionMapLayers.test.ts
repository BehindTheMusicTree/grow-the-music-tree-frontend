import { describe, expect, it } from "vitest";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema, WORLD_ID } from "@schemas/api/region-map";
import {
  buildStyle,
  describe as describeRegion,
  EMPTY_FILL,
  fillColorExpression,
  levelBounds,
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
  it("is a globe with an atmosphere and layers ordered ocean, regions, zone", () => {
    const style = buildStyle();

    expect(style.projection).toEqual({ type: "globe" });
    expect(style.sky).toBeDefined();
    expect(style.layers.map((layer) => layer.id)).toEqual([
      "ocean",
      "region-fill",
      "region-line",
      "zone-fill",
      "zone-line",
    ]);
  });
});
