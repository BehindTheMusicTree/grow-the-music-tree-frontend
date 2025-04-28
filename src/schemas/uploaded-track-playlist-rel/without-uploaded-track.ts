import { z } from "zod";
import { PlaylistSimpleSchema } from "@domain/playlist/response/simple";

export const UploadedTrackPlaylistRelWithoutUploadedTrackSchema = z.object({
  playlist: PlaylistSimpleSchema,
  position: z.number().min(0),
});

export type UploadedTrackPlaylistRel = z.infer<typeof UploadedTrackPlaylistRelWithoutUploadedTrackSchema>;
