import { describe, expect, it } from "vitest";
import { mapEntityHref, mapRegionHref, treeGenreHref, viewSwitchHref } from "./searchHrefs";

describe("searchHrefs", () => {
  it("keys the tree by genre entity uuid, and gives no link without one", () => {
    expect(treeGenreHref("pl-1")).toBe("/?genre=pl-1");
    expect(treeGenreHref(null)).toBeNull();
  });

  it("opens the map on a region, with the genre when there is one", () => {
    expect(mapRegionHref("Q142")).toBe("/map?region=Q142");
    expect(mapRegionHref("Q142", "g1")).toBe("/map?region=Q142&genre=g1");
  });

  it("carries the open genre, artist and song between views, and nothing else", () => {
    const params = new URLSearchParams("genre=g1&artist=a1&song=s1&zoom=rock&region=Q1&at=2,46,5");
    expect(viewSwitchHref("/map", params)).toBe("/map?genre=g1&artist=a1&song=s1");
    expect(viewSwitchHref("/", new URLSearchParams("artist=a1&at=2,46,5"))).toBe("/?artist=a1");
    expect(viewSwitchHref("/", new URLSearchParams("at=2,46,5"))).toBe("/");
  });

  it("opens an artist or song on the map keeping the camera and replacing the other panel entities", () => {
    const params = new URLSearchParams("at=2,46,5&region=Q1&genre=g1&artist=a1");
    expect(mapEntityHref("song", "s1", params)).toBe("/map?at=2%2C46%2C5&region=Q1&song=s1");
    expect(mapEntityHref("artist", "a2", params)).toBe("/map?at=2%2C46%2C5&region=Q1&artist=a2");
  });
});
