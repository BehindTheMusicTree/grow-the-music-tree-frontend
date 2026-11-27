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
  it("keeps one entry per genre, with every region listing it once", () => {
    // Q2 is listed by Brittany (admin unit under France) and by the Celtic nations zone.
    const entries = buildRegionGenreEntries(index, [lexiconEntry("Q2", "Celtic music")]);
    expect(entries).toHaveLength(1);
    const ids = entries[0].regions.map((region) => region.id);
    expect(ids).toContain("Q12130");
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts the regions of which the genre is the overview first", () => {
    // Q2 is listed by Brittany and the Celtic zone; make France's overview the same genre.
    const withOverview = RegionMapIndexSchema.parse({
      ...fixture,
      regions: fixture.regions.map((region) => (region.id === "Q142" ? { ...region, overviewItemId: "Q2" } : region)),
    });
    const [entry] = buildRegionGenreEntries(withOverview, [lexiconEntry("Q2", "Celtic music")]);
    expect(entry.isOverview).toBe(true);
    expect(entry.regions[0].id).toBe("Q142");
  });

  it("leaves out items the lexicon does not know", () => {
    expect(buildRegionGenreEntries(index, [])).toEqual([]);
  });
});
