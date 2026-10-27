import { z } from "zod";

const QID_PATTERN = /^Q[0-9]+$/;
const NonEmpty = z.string().min(1);

const LaneSchema = z
  .object({
    entityId: NonEmpty,
    label: NonEmpty,
    startYear: z.number().int().nullable(),
    endYear: z.number().int(),
  })
  .strict();

const ColumnSchema = z
  .object({
    id: NonEmpty,
    position: z.number().int().min(0),
    lanes: z.array(LaneSchema).min(1),
  })
  .strict();

const BandSchema = z
  .object({
    entityId: NonEmpty,
    label: NonEmpty,
    fragment: z.number().int().min(0),
    startPosition: z.number().int().min(0),
    endPosition: z.number().int().min(0),
    startYear: z.number().int().nullable(),
    endYear: z.number().int().nullable(),
  })
  .strict();

const SuccessionSchema = z.object({ predecessorId: NonEmpty, successorId: NonEmpty }).strict();

const TraditionSchema = z
  .object({
    wikidataId: z.string().regex(QID_PATTERN),
    label: NonEmpty,
    start: z.number().int().nullable(),
    end: z.number().int().nullable(),
    anchorId: z.string().nullable(),
    inCanonicalTree: z.boolean(),
  })
  .strict();

export const TRADITION_LINK_KINDS = ["lineage", "association"] as const;

const TraditionLinkSchema = z
  .object({
    sourceId: z.string().regex(QID_PATTERN),
    targetId: z.string().regex(QID_PATTERN),
    kind: z.enum(TRADITION_LINK_KINDS),
  })
  .strict();

/** Mirrors the pipelines repo's pipelines/gold/src/gold/schemas/genealogy.schema.json. */
export const GenealogySchema = z
  .object({
    columns: z.array(ColumnSchema),
    bands: z.array(BandSchema),
    successions: z.array(SuccessionSchema),
    traditions: z.array(TraditionSchema),
    traditionLinks: z.array(TraditionLinkSchema),
  })
  .strict();

export type Genealogy = z.infer<typeof GenealogySchema>;
export type GenealogyColumn = Genealogy["columns"][number];
export type GenealogyLane = GenealogyColumn["lanes"][number];
export type GenealogyBand = Genealogy["bands"][number];
export type GenealogyTradition = Genealogy["traditions"][number];
export type GenealogyTraditionLink = Genealogy["traditionLinks"][number];
