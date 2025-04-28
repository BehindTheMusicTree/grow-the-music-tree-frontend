import { z } from "zod";
import { PlaylistMinimumSchema } from "@domain/playlist/minimum";

export const UploadedTrackPlaylistRelWithoutUploadedTrackSchema = z.object({
  playlist: PlaylistMinimumSchema,
  position: z.number().min(0),
});

export type UploadedTrackPlaylistRel = z.infer<typeof UploadedTrackPlaylistRelWithoutUploadedTrackSchema>;
