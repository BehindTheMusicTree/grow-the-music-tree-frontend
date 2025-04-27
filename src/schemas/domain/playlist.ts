import { z } from "zod";

import { UuidResourceSchema } from "./uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "./uploaded-track-playlist-rel";
import { PlaylistMinimumSchema } from "./playlist/shared";

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
export type PlaylistMinimum = z.infer<typeof PlaylistMinimumSchema>;
