import { z } from "zod";
import { MbArtistDetailedSchema } from "@domain/mb-artist";
export const MbRecordingDetailedSchema = z.object({
  musicbrainzId: z.string().uuid(),
  title: z.string(),
  score: z.number().min(0).max(1),
  musicbrainzArtists: z.array(MbArtistDetailedSchema),
  musicbrainzLink: z.string().url(),
  durationInSec: z.number().min(0),
  durationStrInHourMinSec: z.string(),
  releaseDate: z.string().datetime(),
});

export type MusicbrainzRecordingDetailed = z.infer<typeof MbRecordingDetailedSchema>;
