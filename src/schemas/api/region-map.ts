import { z } from "zod";

export const WORLD_ID = "world";

const NonEmpty = z.string().min(1);
const Position = z.tuple([z.number(), z.number()]);

const RegionGenreSchema = z
  .object({
    itemId: NonEmpty,
    rule: NonEmpty,
    relation: z.enum(["canonical", "regional", "tradition"]),
  })
  .strict();

const RegionSchema = z
  .object({
    id: NonEmpty,
    name: NonEmpty,
    kind: z.enum(["country", "admin_unit", "zone", "city"]),
    parentId: z.string().nullable(),
    childIds: z.array(NonEmpty),
    zoneIds: z.array(NonEmpty),
    /** Point regions of kind "city" under an admin unit; not part of `childIds`. Optional until every published index carries them. */
    cityIds: z.array(NonEmpty).optional(),
    boundaryStatus: z.enum(["available", "missing"]).optional(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable(),
    mainBbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).nullable(),
    centroid: Position.nullable(),
    drillable: z.boolean(),
    /** Wikidata item id of the region's "Music of X" genre; null when it has none. */
    overviewItemId: NonEmpty.nullable(),
    /**
     * Without its own overview, the overview of the region's nearest admin ancestor that has one ("Music of France"
     * for Normandie); null on zones.
     */
    inheritedOverviewItemId: NonEmpty.nullable(),
    genres: z.array(RegionGenreSchema),
    songCount: z.number().int().min(0),
    genreCount: z.number().int().min(0),
  })
  .strict()
  .refine((region) => {
    const coordinates = [region.bbox, region.mainBbox, region.centroid];
    return region.boundaryStatus === "missing"
      ? coordinates.every((value) => value === null)
      : coordinates.every((value) => value !== null);
  }, { message: "Boundary status and coordinates disagree" });

/** A subdivision kept out of the map until a genre is attached to it by hand (`tradition_placement_overrides`). */
const HiddenRegionSchema = z
  .object({
    id: NonEmpty,
    name: NonEmpty,
    kind: z.enum(["country", "admin_unit", "zone", "city"]),
    parentId: NonEmpty,
    centroid: Position,
  })
  .strict();

const RegionMapIndexShapeSchema = z
  .object({
    regions: z.array(RegionSchema).min(1),
    /** sha256 of the PMTiles file served at `regions/<sha256>.pmtiles`; immutable per content hash. */
    tileset: z.string().regex(/^[0-9a-f]{64}$/),
    /** Regions and zones shown at the world level. Optional until every published index carries them. */
    worldChildIds: z.array(NonEmpty).optional(),
    worldZoneIds: z.array(NonEmpty).optional(),
    /** Optional: absent when every subdivision is drawn. Never part of `regions` or the tileset. */
    hiddenRegions: z.array(HiddenRegionSchema).optional(),
  })
  .strict();

/**
 * Mirrors grow-api's region map index contract (`grow/region_map/bulk_import/merge.py`, `_check_index`).
 * An index published before `worldChildIds`/`worldZoneIds` existed implied the world level through `parentId`;
 * the transform restores it so the rest of the app reads one shape. Drop it once every index carries the fields.
 */
export const RegionMapIndexSchema = RegionMapIndexShapeSchema.transform((index) => ({
  ...index,
  worldChildIds:
    index.worldChildIds ?? index.regions.filter((region) => region.parentId === WORLD_ID).map((region) => region.id),
  worldZoneIds:
    index.worldZoneIds ??
    index.regions.filter((region) => region.kind === "zone" && region.parentId === null).map((region) => region.id),
}));

export type RegionMapIndex = z.infer<typeof RegionMapIndexSchema>;
export type Region = RegionMapIndex["regions"][number];
