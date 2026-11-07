import { describe, expect, it } from "vitest";
import { mapGenreHref, mapRegionHref, treeGenreHref } from "./searchHrefs";

describe("searchHrefs", () => {
  it("keys the tree by genre playlist uuid, and gives no link without one", () => {
    expect(treeGenreHref("pl-1")).toBe("/?genre=pl-1");
    expect(treeGenreHref(null)).toBeNull();
  });

  it("keys the map by region and criteria uuid", () => {
    expect(mapRegionHref("Q142")).toBe("/map?region=Q142");
    expect(mapGenreHref("Q142", "g 1")).toBe("/map?region=Q142&genre=g%201");
  });
});
