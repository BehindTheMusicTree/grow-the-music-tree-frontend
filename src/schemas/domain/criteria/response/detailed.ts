import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { CriteriaSimpleSchema } from "./simple";

export const CriteriaDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: CriteriaSimpleSchema.nullable(),
  ascendants: z.array(CriteriaSimpleSchema),
  descendants: z.array(CriteriaSimpleSchema),
  root: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  children: z.array(z.string().uuid()),
  criteriaPlaylist: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  uploadedTracks: z.array(z.unknown()),
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

export type CriteriaDetailed = z.infer<typeof CriteriaDetailedSchema>;
