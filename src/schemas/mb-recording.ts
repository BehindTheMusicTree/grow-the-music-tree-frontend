import { z } from "zod";

export const MbRecordingDetailedSchema = z.object({
  uuid: z.string().uuid(),
  mbid: z.string(),
  title: z.string(),
  artists: z.array(
    z.object({
      uuid: z.string().uuid(),
      name: z.string(),
      mbid: z.string(),
    })
  ),
  durationInSec: z.number(),
  durationStrInHourMinSec: z.string(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type MusicbrainzRecordingDetailed = z.infer<typeof MbRecordingDetailedSchema>;

export const MbRecordingMinimumSchema = MbRecordingDetailedSchema.pick({
  uuid: true,
  mbid: true,
  title: true,
  artists: true,
  durationInSec: true,
  durationStrInHourMinSec: true,
});

export type MusicbrainzRecordingMinimum = z.infer<typeof MbRecordingMinimumSchema>;
