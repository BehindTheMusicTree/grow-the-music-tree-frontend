import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@domain/uploaded-track-playlist-rel/without-playlist";
import { CriteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";

export const PlaylistDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  typeLabel: z.string(),
  uploadedTracksCount: z.number(),
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  uploadedTracksArchivedCount: z.number(),
  criteria: CriteriaMinimumSchema,
  parent: CriteriaMinimumSchema.nullable(),
  root: CriteriaMinimumSchema,
  updatedAt: z.string().datetime(),
  tracks: z.array(z.string().uuid()),
});

export type PlaylistDetailed = z.infer<typeof PlaylistDetailedSchema>;
