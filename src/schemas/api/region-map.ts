import { z } from "zod";

const NonEmpty = z.string().min(1);
const Position = z.tuple([z.number(), z.number()]);
const Ring = z.array(Position);

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

/** Mirrors the pipelines repo's pipelines/gold/src/gold/schemas/region_map.schema.json. */
export const RegionMapIndexSchema = z
  .object({
    regions: z.array(RegionSchema).min(1),
    files: z.record(NonEmpty, z.string().regex(/^[0-9a-f]{64}$/)),
  })
  .strict();

const RegionFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: NonEmpty,
  properties: z.object({ id: NonEmpty, name: NonEmpty }),
  geometry: z.discriminatedUnion("type", [
    z.object({ type: z.literal("Polygon"), coordinates: z.array(Ring) }),
    z.object({ type: z.literal("MultiPolygon"), coordinates: z.array(z.array(Ring)) }),
  ]),
});

/** One level (`geometry/<id>.geojson`) or zone (`zones/<id>.geojson`) of the region map. */
export const RegionFeatureCollectionSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(RegionFeatureSchema),
});

export const WORLD_ID = "world";

export type RegionMapIndex = z.infer<typeof RegionMapIndexSchema>;
export type Region = RegionMapIndex["regions"][number];
export type RegionFeatureCollection = z.infer<typeof RegionFeatureCollectionSchema>;
export type RegionFeature = RegionFeatureCollection["features"][number];
