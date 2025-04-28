import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@domain/uploaded-track-playlist-rel/without-playlist";

export const PlaylistDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  typeLabel: z.string(),
  uploadedTracksNotArchivedCount: z.number(),
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  uploadedTracksArchivedCount: z.number(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tracks: z.array(z.string().uuid()),
});

export type PlaylistDetailed = z.infer<typeof PlaylistDetailedSchema>;
