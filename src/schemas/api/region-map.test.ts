import { describe, it, expect } from "vitest";
import fixture from "./region-map.fixture.json";
import { RegionFeatureCollectionSchema, RegionMapIndexSchema } from "./region-map";

const square = [
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
  ],
];

describe("RegionMapIndexSchema", () => {
  it("parses a Gold 5_region_map/index.json sample", () => {
    expect(RegionMapIndexSchema.safeParse(fixture).success).toBe(true);
  });

  it("rejects unknown keys, a malformed file hash and an unknown kind", () => {
    expect(RegionMapIndexSchema.safeParse({ ...fixture, extra: 1 }).success).toBe(false);
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...fixture.regions[0], extra: 1 }] }).success).toBe(
      false,
    );
    expect(RegionMapIndexSchema.safeParse({ ...fixture, files: { "geometry/world.geojson": "abc" } }).success).toBe(
      false,
    );
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...fixture.regions[0], kind: "city" }] }).success,
    ).toBe(false);
  });
});

describe("RegionFeatureCollectionSchema", () => {
  it("parses Polygon and MultiPolygon features and rejects other geometries", () => {
    const feature = (geometry: object) => ({
      type: "Feature",
      id: "Q142",
      properties: { id: "Q142", name: "France" },
      geometry,
    });

    expect(
      RegionFeatureCollectionSchema.safeParse({
        type: "FeatureCollection",
        features: [
          feature({ type: "Polygon", coordinates: square }),
          feature({ type: "MultiPolygon", coordinates: [square] }),
        ],
      }).success,
    ).toBe(true);
    expect(
      RegionFeatureCollectionSchema.safeParse({
        type: "FeatureCollection",
        features: [feature({ type: "Point", coordinates: [0, 0] })],
      }).success,
    ).toBe(false);
  });
});
