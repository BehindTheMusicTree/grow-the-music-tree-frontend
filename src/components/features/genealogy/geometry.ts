import type { Genealogy } from "@schemas/api/genealogy";

export const COLUMN_WIDTH = 44;
export const AXIS_WIDTH = 64;
export const TOP_MARGIN = 32;

export const columnX = (position: number) => AXIS_WIDTH + position * COLUMN_WIDTH + COLUMN_WIDTH / 2;

/** Where each lane or band entity sits on the x axis, by the pipeline's column index. */
export type AnchorIndex = {
  lanePosition: Map<string, number>;
  fragments: Map<string, Genealogy["bands"]>;
};

export function buildAnchorIndex({ columns, bands }: Genealogy): AnchorIndex {
  const lanePosition = new Map<string, number>();
  for (const column of columns) for (const lane of column.lanes) lanePosition.set(lane.entityId, column.position);
  const fragments = new Map<string, Genealogy["bands"]>();
  for (const band of bands) fragments.set(band.entityId, [...(fragments.get(band.entityId) ?? []), band]);
  return { lanePosition, fragments };
}

const covers = (year: number | null) => (band: Genealogy["bands"][number]) =>
  year !== null && (band.startYear === null || band.startYear <= year) && (band.endYear === null || year <= band.endYear);

/** The x position of an anchor entity; a band is split in fragments, so the one alive at `year` wins. */
export function anchorPosition({ lanePosition, fragments }: AnchorIndex, anchorId: string, year: number | null) {
  const lane = lanePosition.get(anchorId);
  if (lane !== undefined) return lane;
  const bandFragments = fragments.get(anchorId);
  if (!bandFragments) return null;
  const fragment = bandFragments.find(covers(year)) ?? bandFragments[0]!;
  return (fragment.startPosition + fragment.endPosition) / 2;
}
