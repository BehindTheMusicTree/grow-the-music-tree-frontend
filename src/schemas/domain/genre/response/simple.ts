import { z } from "zod";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";
import { GenreLineageRelWithoutDescendantsSchema, GenreLineageRelWithoutAscendantsSchema } from "../lineage-rel";
import { GenrePlaylistMinimumSchema } from "@schemas/domain/genre-playlist";
import { UploadedTrackMinimumSchema } from "../../uploaded-track/response";
import { GenreMinimumSchema } from "./minimum";

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
