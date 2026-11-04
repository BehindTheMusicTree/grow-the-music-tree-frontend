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
    kind: z.enum(["country", "admin_unit", "zone"]),
    parentId: z.string().nullable(),
    childIds: z.array(NonEmpty),
    zoneIds: z.array(NonEmpty),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    mainBbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    centroid: Position,
    drillable: z.boolean(),
    /** Wikidata item id of the region's "Music of X" genre. Optional until every published index carries it. */
    overviewItemId: NonEmpty.nullable().optional(),
    genres: z.array(RegionGenreSchema),
    songCount: z.number().int().min(0),
    genreCount: z.number().int().min(0),
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
  })
  .strict();

/**
 * Mirrors grow-api's region map index contract (`grow/region_map/bulk_import/merge.py`, `_check_index`).
 * An index published before `worldChildIds`/`worldZoneIds` existed implied the world level through `parentId`;
 * the transform restores it so the rest of the app reads one shape. Drop it once every index carries the fields.
 */
export const RegionMapIndexSchema = RegionMapIndexShapeSchema.transform((index) => ({
  ...index,
  worldChildIds: index.worldChildIds ?? index.regions.filter((region) => region.parentId === WORLD_ID).map((region) => region.id),
  worldZoneIds:
    index.worldZoneIds ?? index.regions.filter((region) => region.kind === "zone" && region.parentId === null).map((region) => region.id),
}));

export type RegionMapIndex = z.infer<typeof RegionMapIndexSchema>;
export type Region = RegionMapIndex["regions"][number];
