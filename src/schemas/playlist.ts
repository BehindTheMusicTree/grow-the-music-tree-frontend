import { z } from "zod";

import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@schemas/uploaded-track-playlist-rel";

export const PlaylistDetailedSchema = z.object({
  uuid: z.string().uuid(),
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

export const PlaylistMinimumSchema = PlaylistDetailedSchema.pick({
  uuid: true,
  name: true,
});

export type PlaylistMinimum = z.infer<typeof PlaylistMinimumSchema>;
