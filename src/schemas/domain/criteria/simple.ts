import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";
import {
  CriteriaLineageRelWithoutDescendantsSchema,
  CriteriaLineageRelWithoutAscendantsSchema,
} from "./lineage-rel/detailed";
import { GenrePlaylistMinimumSchema } from "@domain/criteria-playlist";
import { UploadedTrackMinimumSchema } from "@domain/uploaded-track/response/minimum";
import { CrteriaMinimumSchema } from "./response/minimum";

export const GenreSimpleSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: CrteriaMinimumSchema,
  ascendants: z.array(CriteriaLineageRelWithoutDescendantsSchema),
  descendants: z.array(CriteriaLineageRelWithoutAscendantsSchema),
  root: CrteriaMinimumSchema,
  children: z.array(CrteriaMinimumSchema),
  criteriaPlaylist: GenrePlaylistMinimumSchema,
  uploadedTracksNotArchived: z.array(UploadedTrackMinimumSchema),
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenreSimple = z.infer<typeof GenreSimpleSchema>;
