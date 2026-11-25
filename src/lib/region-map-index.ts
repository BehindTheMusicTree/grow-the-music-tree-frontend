import type { Region, RegionMapIndex } from "@schemas/api/region-map";

const lookups = new WeakMap<RegionMapIndex, ReadonlyMap<string, Region>>();

/** Share derived data between search and map observers of the same query result. */
export function regionMapLookup(index: RegionMapIndex): ReadonlyMap<string, Region> {
  let regions = lookups.get(index);
  if (!regions) {
    regions = new Map(index.regions.map((region) => [region.id, region]));
    lookups.set(index, regions);
  }
  return regions;
}
