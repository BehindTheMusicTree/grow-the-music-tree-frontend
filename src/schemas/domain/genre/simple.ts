import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";
import { GenreLineageRelWithoutDescendantsSchema, GenreLineageRelWithoutAscendantsSchema } from "./lineage-rel";
import { GenrePlaylistMinimumSchema } from "@domain/genre-playlist";
import { UploadedTrackMinimumSchema } from "@domain/uploaded-track/response/minimum";
import { GenreMinimumSchema } from "./response/minimum";

export const GenreSimpleSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: GenreMinimumSchema,
  ascendants: z.array(GenreLineageRelWithoutDescendantsSchema),
  descendants: z.array(GenreLineageRelWithoutAscendantsSchema),
  root: GenreMinimumSchema,
  children: z.array(GenreMinimumSchema),
  criteriaPlaylist: GenrePlaylistMinimumSchema,
  uploadedTracksNotArchived: z.array(UploadedTrackMinimumSchema),
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenreSimple = z.infer<typeof GenreSimpleSchema>;
