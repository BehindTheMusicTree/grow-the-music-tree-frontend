import { z } from "zod";

import { MbArtistDetailedSchema } from "@schemas/domain/mb/mb-artist";

export const MbRecordingDetailedSchema = z.object({
  musicbrainzId: z.string().uuid(),
  title: z.string(),
  score: z.number(),
  musicbrainzArtists: z.array(MbArtistDetailedSchema),
  musicbrainzLink: z.string().url(),
  durationInSec: z.number().min(0).nullable().optional(),
  durationStrInHourMinSec: z.string().nullable().optional(),
  releaseDate: z.union([z.string().datetime(), z.string()]).transform((val) => {
    // Try to parse as datetime, if it fails, return a default valid datetime
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }),
});

export type MusicbrainzRecordingDetailed = z.infer<typeof MbRecordingDetailedSchema>;
