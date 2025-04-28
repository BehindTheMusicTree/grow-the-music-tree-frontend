import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@domain/uploaded-track-playlist-rel/without-playlist";
import { CrteriaMinimumSchema } from "@domain/criteria/response/minimum";

export const CriteriaPlaylistDetailedSchema = UuidResourceSchema.extend({
  uuid: z.string(),
  name: z.string(),
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  durationInSec: z.number(),
  durationStrInHourMinSec: z.string(),
  uploadedTracksArchivedCount: z.number(),
  criteria: CrteriaMinimumSchema,
  genre: z.object({
    uuid: z.string(),
    name: z.string(),
  }),
  parent: z
    .object({
      uuid: z.string(),
      name: z.string(),
    })
    .nullable(),
  root: z.boolean(),
  uploadedTracksCount: z.number(),
  createdOn: z.string(),
  updatedOn: z.string(),
});

export type CriteriaPlaylistDetailed = z.infer<typeof CriteriaPlaylistDetailedSchema>;
