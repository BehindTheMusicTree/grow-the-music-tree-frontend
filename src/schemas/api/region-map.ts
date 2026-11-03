import { z } from "zod";

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
    genres: z.array(RegionGenreSchema),
    songCount: z.number().int().min(0),
    genreCount: z.number().int().min(0),
  })
  .strict();

/** Mirrors grow-api's region map index contract (`grow/region_map/bulk_import/merge.py`, `_check_index`). */
export const RegionMapIndexSchema = z
  .object({
    regions: z.array(RegionSchema).min(1),
    /** sha256 of the PMTiles file served at `regions/<sha256>.pmtiles`; immutable per content hash. */
    tileset: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export const WORLD_ID = "world";

export type RegionMapIndex = z.infer<typeof RegionMapIndexSchema>;
export type Region = RegionMapIndex["regions"][number];
