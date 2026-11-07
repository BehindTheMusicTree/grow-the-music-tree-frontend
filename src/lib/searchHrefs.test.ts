import { describe, expect, it } from "vitest";
import { mapRegionHref, treeGenreHref } from "./searchHrefs";

describe("searchHrefs", () => {
  it("keys the tree by genre playlist uuid, and gives no link without one", () => {
    expect(treeGenreHref("pl-1")).toBe("/?genre=pl-1");
    expect(treeGenreHref(null)).toBeNull();
  });

  it("opens the map on a region, with the genre when there is one", () => {
    expect(mapRegionHref("Q142")).toBe("/map?region=Q142");
    expect(mapRegionHref("Q142", "g1")).toBe("/map?region=Q142&genre=g1");
  });
});
