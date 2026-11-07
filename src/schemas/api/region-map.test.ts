import { describe, it, expect } from "vitest";
import fixture from "./region-map.fixture.json";
import { RegionMapIndexSchema } from "./region-map";

describe("RegionMapIndexSchema", () => {
  it("parses a grow-api region map index sample", () => {
    expect(RegionMapIndexSchema.safeParse(fixture).success).toBe(true);
  });

  it("accepts missing boundaries only with null coordinates", () => {
    const missing = { ...fixture.regions[0], boundaryStatus: "missing", bbox: null, mainBbox: null, centroid: null };
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [missing] }).success).toBe(true);
    for (const invalid of [
      { ...missing, boundaryStatus: "available" },
      { ...missing, boundaryStatus: undefined },
      { ...missing, centroid: [0, 0] },
      { ...fixture.regions[0], boundaryStatus: "missing" },
    ]) {
      expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [invalid] }).success).toBe(false);
    }
  });

  it("accepts missing boundaries and hidden regions together", () => {
    const missing = { ...fixture.regions[0], boundaryStatus: "missing", bbox: null, mainBbox: null, centroid: null };
    const hidden = { id: "hidden", name: "Hidden", kind: "admin_unit", parentId: "world", centroid: [1, 2] };
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [missing], hiddenRegions: [hidden] }).success).toBe(true);
  });

  it("accepts a bbox that crosses the antimeridian", () => {
    const fiji = { ...fixture.regions[0], bbox: [177, -20, 182, -16], mainBbox: [177, -20, 182, -16] };

    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [fiji] }).success).toBe(true);
  });

  it("requires the tileset to be a bare sha256 string", () => {
    expect(RegionMapIndexSchema.safeParse({ ...fixture, tileset: undefined }).success).toBe(false);
    expect(RegionMapIndexSchema.safeParse({ ...fixture, tileset: "latest" }).success).toBe(false);
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, tileset: { path: `regions/${"d".repeat(64)}.pmtiles` } }).success,
    ).toBe(false);
  });

  it("requires both overview keys on every region, null when there is none", () => {
    const withoutOwn = { ...fixture.regions[0], overviewItemId: undefined };
    const withoutInherited = { ...fixture.regions[0], inheritedOverviewItemId: undefined };

    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [withoutOwn] }).success).toBe(false);
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [withoutInherited] }).success).toBe(false);
  });

  it("accepts a city point region and the cityIds of its admin unit", () => {
    const rennes = {
      ...fixture.regions[0],
      id: "Q647",
      kind: "city",
      parentId: fixture.regions[0].id,
      childIds: [],
      zoneIds: [],
      bbox: [-1.68, 48.11, -1.68, 48.11],
      mainBbox: [-1.68, 48.11, -1.68, 48.11],
      centroid: [-1.68, 48.11],
      drillable: false,
    };
    const parent = { ...fixture.regions[0], cityIds: ["Q647"] };

    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [parent, rennes] }).success).toBe(true);
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...parent, cityIds: [""] }] }).success).toBe(false);
  });

  it("accepts the overview a region inherits from its nearest ancestor", () => {
    const normandie = { ...fixture.regions[0], overviewItemId: null, inheritedOverviewItemId: "Q672134" };

    expect(RegionMapIndexSchema.parse({ ...fixture, regions: [normandie] }).regions[0].inheritedOverviewItemId).toBe(
      "Q672134",
    );
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...normandie, inheritedOverviewItemId: null }] })
        .success,
    ).toBe(true);
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...normandie, inheritedOverviewItemId: "" }] }).success,
    ).toBe(false);
  });

  it("rejects unknown keys (including the removed files map) and an unknown kind", () => {
    expect(RegionMapIndexSchema.safeParse({ ...fixture, extra: 1 }).success).toBe(false);
    expect(RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...fixture.regions[0], extra: 1 }] }).success).toBe(
      false,
    );
    expect(RegionMapIndexSchema.safeParse({ ...fixture, files: {} }).success).toBe(false);
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, regions: [{ ...fixture.regions[0], kind: "village" }] }).success,
    ).toBe(false);
  });

  it("fills the world level from parentId while the index predates worldChildIds", () => {
    const parsed = RegionMapIndexSchema.parse(fixture);

    expect(parsed.worldChildIds).toEqual(fixture.regions.filter((r) => r.parentId === "world").map((r) => r.id));
    expect(parsed.worldZoneIds).toEqual(
      fixture.regions.filter((r) => r.kind === "zone" && r.parentId === null).map((r) => r.id),
    );
  });

  it("keeps the world level an index provides", () => {
    const parsed = RegionMapIndexSchema.parse({ ...fixture, worldChildIds: ["Q183"], worldZoneIds: [] });

    expect(parsed.worldChildIds).toEqual(["Q183"]);
    expect(parsed.worldZoneIds).toEqual([]);
  });

  it("accepts hidden regions outside the drawn ones and refuses unknown keys on them", () => {
    const normandy = {
      id: "Q18677875",
      name: "Normandy",
      kind: "admin_unit",
      parentId: "Q142",
      centroid: [1.02, 49.38],
    };

    expect(RegionMapIndexSchema.safeParse({ ...fixture, hiddenRegions: [normandy] }).success).toBe(true);
    expect(
      RegionMapIndexSchema.safeParse({ ...fixture, hiddenRegions: [{ ...normandy, bbox: [0, 0, 1, 1] }] }).success,
    ).toBe(false);
  });
});
