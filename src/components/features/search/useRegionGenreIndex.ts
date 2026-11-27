import { useMemo } from "react";
import type { RegionGenreLexiconEntry } from "@behindthemusictree/app-kit/genre-tree";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";

export type RegionGenreEntry = {
  genre: RegionGenreLexiconEntry;
  /** Every region listing the genre: its own overviews first, then regional or tradition, then canonical, by name. */
  regions: readonly Region[];
  /** The genre is the "Music of X" of at least one region. */
  isOverview: boolean;
};

const RELATION_RANK = { regional: 0, tradition: 0, canonical: 1 } as const;
// An overview is the region's own "Music of X": it outranks every genre listing.
const OVERVIEW_RANK = -1;

/** Resolves the index's Wikidata ids to lexicon genres, each with all the regions that list it. */
export function buildRegionGenreEntries(index: RegionMapIndex, lexicon: readonly RegionGenreLexiconEntry[]): RegionGenreEntry[] {
  const byQid = new Map(lexicon.map((entry) => [entry.wikidataId, entry]));
  const found = new Map<string, { genre: RegionGenreLexiconEntry; ranks: Map<Region, number> }>();

  const offer = (qid: string, region: Region, rank: number) => {
    const genre = byQid.get(qid);
    if (!genre) return;
    let held = found.get(genre.uuid);
    if (!held) found.set(genre.uuid, (held = { genre, ranks: new Map() }));
    const previous = held.ranks.get(region);
    if (previous === undefined || rank < previous) held.ranks.set(region, rank);
  };

  for (const region of index.regions) {
    if (region.overviewItemId) offer(region.overviewItemId, region, OVERVIEW_RANK);
    for (const { itemId, relation } of region.genres) offer(itemId, region, RELATION_RANK[relation]);
  }
  return Array.from(found.values()).map(({ genre, ranks }) => ({
    genre,
    regions: Array.from(ranks.keys()).sort(
      (a, b) => (ranks.get(a) as number) - (ranks.get(b) as number) || a.name.localeCompare(b.name),
    ),
    isOverview: Array.from(ranks.values()).includes(OVERVIEW_RANK),
  }));
}

export function useRegionGenreIndex(index: RegionMapIndex | null | undefined, lexicon: readonly RegionGenreLexiconEntry[]) {
  return useMemo(() => (index ? buildRegionGenreEntries(index, lexicon) : []), [index, lexicon]);
}
