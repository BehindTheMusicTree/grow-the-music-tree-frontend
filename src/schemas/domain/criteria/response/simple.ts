import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { CriteriaLineageRelWithoutDescendantSchema } from "../lineage-rel/without-descendant";
import { CriteriaLineageRelWithoutAscendantSchema } from "../lineage-rel/without-ascendant";
import { CriteriaPlaylistMinimumSchema } from "@domain/playlist/criteria-playlist/minimum";
import { UploadedTrackMinimumSchema } from "@domain/uploaded-track/response/minimum";
import { CrteriaMinimumSchema } from "./minimum";

export const CriteriaSimpleSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: CrteriaMinimumSchema,
  ascendants: z.array(CriteriaLineageRelWithoutDescendantSchema),
  descendants: z.array(CriteriaLineageRelWithoutAscendantSchema),
  root: CrteriaMinimumSchema,
  children: z.array(CrteriaMinimumSchema),
  criteriaPlaylist: CriteriaPlaylistMinimumSchema,
  uploadedTracksNotArchived: z.array(UploadedTrackMinimumSchema),
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type CriteriaSimple = z.infer<typeof CriteriaSimpleSchema>;
