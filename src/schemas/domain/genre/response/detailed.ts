import { z } from "zod";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";
import { GenreSimpleSchema } from "../simple";

export const GenreDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: GenreSimpleSchema,
  ascendants: z.array(GenreSimpleSchema),
  descendants: z.array(GenreSimpleSchema),
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

export type GenreDetailed = z.infer<typeof GenreDetailedSchema>;
