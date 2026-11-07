import { describe, expect, it } from "vitest";
import type { RegionGenreLexiconEntry } from "@behindthemusictree/app-kit/genre-tree";
import fixture from "@schemas/api/region-map.fixture.json";
import { RegionMapIndexSchema } from "@schemas/api/region-map";
import { buildRegionGenreEntries } from "./useRegionGenreIndex";

const index = RegionMapIndexSchema.parse(fixture);
const lexiconEntry = (wikidataId: string, name: string) =>
  ({
    wikidataId,
    uuid: `uuid-${wikidataId}`,
    name,
    treeName: "regional",
    genrePlaylistUuid: null,
    isUmbrella: false,
    viewsCount: 0,
  }) as unknown as RegionGenreLexiconEntry;

describe("buildRegionGenreEntries", () => {
  it("keeps one entry per genre, in its most specific region", () => {
    // Q2 is listed by Brittany (admin unit under France) and by the Celtic nations zone.
    const entries = buildRegionGenreEntries(index, [lexiconEntry("Q2", "Celtic music")]);
    expect(entries).toHaveLength(1);
    expect(entries[0].region.id).toBe("Q12130");
  });

  it("leaves out items the lexicon does not know", () => {
    expect(buildRegionGenreEntries(index, [])).toEqual([]);
  });
});
