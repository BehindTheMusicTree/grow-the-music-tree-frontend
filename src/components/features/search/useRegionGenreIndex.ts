import { useMemo } from "react";
import type { RegionGenreLexiconEntry } from "@behindthemusictree/app-kit/genre-tree";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";

export type RegionGenreEntry = {
  genre: RegionGenreLexiconEntry;
  /** The region whose panel lists the genre best. */
  region: Region;
  /** The region's own "Music of X". */
  isOverview: boolean;
};

const RELATION_RANK = { regional: 0, tradition: 0, canonical: 1 } as const;
// An overview is the region's own "Music of X": it outranks every genre listing in the same region.
const OVERVIEW_RANK = -1;

function depth(region: Region, regions: ReadonlyMap<string, Region>): number {
  let levels = 0;
  for (let current = region; current.parentId !== null; levels += 1) {
    const parent = regions.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return levels;
}

/**
 * Resolves the index's Wikidata ids to lexicon genres. A genre listed in several regions keeps the best one:
 * regional or tradition over canonical, then the most specific region.
 */
export function buildRegionGenreEntries(index: RegionMapIndex, lexicon: readonly RegionGenreLexiconEntry[]): RegionGenreEntry[] {
  const byQid = new Map(lexicon.map((entry) => [entry.wikidataId, entry]));
  const regions = new Map(index.regions.map((region) => [region.id, region]));
  const best = new Map<string, { entry: RegionGenreEntry; rank: number; depth: number }>();

  const offer = (qid: string, region: Region, rank: number, isOverview: boolean) => {
    const genre = byQid.get(qid);
    if (!genre) return;
    const regionDepth = depth(region, regions);
    const held = best.get(genre.uuid);
    if (held && (held.rank < rank || (held.rank === rank && held.depth >= regionDepth))) return;
    best.set(genre.uuid, { entry: { genre, region, isOverview }, rank, depth: regionDepth });
  };

  for (const region of index.regions) {
    if (region.overviewItemId) offer(region.overviewItemId, region, OVERVIEW_RANK, true);
    for (const { itemId, relation } of region.genres) offer(itemId, region, RELATION_RANK[relation], false);
  }
  return Array.from(best.values()).map(({ entry }) => entry);
}

export function useRegionGenreIndex(index: RegionMapIndex | null | undefined, lexicon: readonly RegionGenreLexiconEntry[]) {
  return useMemo(() => (index ? buildRegionGenreEntries(index, lexicon) : []), [index, lexicon]);
}
