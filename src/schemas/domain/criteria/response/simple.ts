import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";
import {
  CriteriaLineageRelWithoutDescendantsSchema,
  CriteriaLineageRelWithoutAscendantsSchema,
} from "../lineage-rel/detailed";
import { GenrePlaylistMinimumSchema } from "@domain/genre-playlist";
import { UploadedTrackMinimumSchema } from "@domain/uploaded-track/response/minimum";
import { CrteriaMinimumSchema } from "./minimum";

export const CriteriaSimpleSchema = UuidResourceSchema.extend({
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

export type CriteriaSimple = z.infer<typeof CriteriaSimpleSchema>;
