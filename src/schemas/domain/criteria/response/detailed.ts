import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { CriteriaMinimumSchema } from "./minimum";
import { CriteriaPlaylistMinimumSchema } from "@domain/playlist/criteria-playlist/minimum";
import { UploadedTrackMinimumSchema } from "@domain/uploaded-track/response/minimum";
import { CriteriaLineageRelWithoutAscendantSchema } from "../lineage-rel/without-ascendant";
import { CriteriaLineageRelWithoutDescendantSchema } from "../lineage-rel/without-descendant";

export const CriteriaDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: CriteriaMinimumSchema.nullable(),
  ascendants: z.array(CriteriaLineageRelWithoutDescendantSchema),
  descendants: z.array(CriteriaLineageRelWithoutAscendantSchema),
  root: CriteriaMinimumSchema,
  children: z.array(CriteriaMinimumSchema),
  criteriaPlaylist: CriteriaPlaylistMinimumSchema,
  uploadedTracks: z.array(UploadedTrackMinimumSchema),
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

export type CriteriaDetailed = z.infer<typeof CriteriaDetailedSchema>;
