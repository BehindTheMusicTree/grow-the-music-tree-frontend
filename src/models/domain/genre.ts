import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/uuid-resource";

export const GenreDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  ascendants: z.array(z.string().uuid()),
  descendants: z.array(z.string().uuid()),
  root: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  children: z.array(z.string().uuid()),
  criteriaPlaylist: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  uploadedTracks: z.array(z.unknown()), // Adjust type based on track structure
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenreDetailed = z.infer<typeof GenreDetailedSchema>;

export const GenreSimpleSchema = GenreDetailedSchema.omit({
  ascendants: true,
  descendants: true,
  root: true,
  children: true,
  criteriaPlaylist: true,
  uploadedTracks: true,
  uploadedTracksCount: true,
  uploadedTracksArchivedCount: true,
  updatedOn: true,
});

export type GenreSimple = z.infer<typeof GenreSimpleSchema>;

export const GenreMinimumSchema = GenreDetailedSchema.pick({
  uuid: true,
  name: true,
});

export type GenreMinimum = z.infer<typeof GenreMinimumSchema>;
