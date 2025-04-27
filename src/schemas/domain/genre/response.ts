import { z } from "zod";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";
import { GenreLineageRelWithoutDescendantsSchema, GenreLineageRelWithoutAscendantsSchema } from "./lineage-rel";
import { GenrePlaylistMinimumSchema } from "@schemas/domain/genre-playlist";
import { UploadedTrackMinimumSchema } from "../uploaded-track/response";

export const GenreMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type GenreMinimum = z.infer<typeof GenreMinimumSchema>;

export const GenreSimpleSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: GenreMinimumSchema,
  ascendants: z.array(GenreLineageRelWithoutDescendantsSchema),
  descendants: z.array(GenreLineageRelWithoutAscendantsSchema),
  root: GenreMinimumSchema,
  children: z.array(GenreMinimumSchema),
  criteriaPlaylist: GenrePlaylistMinimumSchema,
  uploadedTracksNotArchived: z.array(UploadedTrackMinimumSchema),
  uploadedTracksNotArchivedCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenreSimple = z.infer<typeof GenreSimpleSchema>;

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
  uploadedTracks: z.array(z.unknown()), // Adjust type based on track structure
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenreDetailed = z.infer<typeof GenreDetailedSchema>;
