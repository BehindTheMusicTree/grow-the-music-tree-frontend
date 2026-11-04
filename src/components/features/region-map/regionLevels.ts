import { WORLD_ID, type Region, type RegionMapIndex } from "@schemas/api/region-map";

export type Level = {
  id: string;
  /** The regions drawn at this level. */
  childIds: readonly string[];
  /** The zones offered by the Zone selector at this level. */
  zoneIds: readonly string[];
};

export function levelOf(
  index: Pick<RegionMapIndex, "worldChildIds" | "worldZoneIds">,
  regions: ReadonlyMap<string, Region>,
  id: string,
): Level | undefined {
  if (id === WORLD_ID) return { id, childIds: index.worldChildIds, zoneIds: index.worldZoneIds };
  const region = regions.get(id);
  return region && { id, childIds: region.childIds, zoneIds: region.zoneIds };
}

/** Keeps the longest leading run of `ids` where each step is a child or zone of the previous level. */
export function validPath(
  index: Pick<RegionMapIndex, "worldChildIds" | "worldZoneIds">,
  regions: ReadonlyMap<string, Region>,
  ids: readonly string[],
): string[] {
  const path: string[] = [];
  let level = levelOf(index, regions, WORLD_ID);
  for (const id of ids) {
    if (!level || !(level.childIds.includes(id) || level.zoneIds.includes(id))) break;
    path.push(id);
    level = levelOf(index, regions, id);
  }
  return path;
}
