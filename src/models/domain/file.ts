import { z } from "zod";
import { MusicbrainzRecordingDetailedSchema } from "./mb-recording";

export const FileDetailedSchema = z.object({
  filename: z.string(),
  extension: z.string(),
  md5HasBeenCorrected: z.boolean(),
  durationInSec: z.number(),
  durationStrInHourMinSec: z.string(),
  fingerprintMissingCause: z.string().optional(),
  sizeInBytes: z.number(),
  sizeInKo: z.number(),
  sizeInMo: z.number(),
  bitrateInKbps: z.number(),
  musicbrainzRecording: MusicbrainzRecordingDetailedSchema,
  musicbrainzRecordingMissingCause: z.string().optional(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type FileDetailed = z.infer<typeof FileDetailedSchema>;

export const FileMinimumSchema = FileDetailedSchema.pick({
  filename: true,
  extension: true,
  durationInSec: true,
  durationStrInHourMinSec: true,
  sizeInBytes: true,
  sizeInKo: true,
  sizeInMo: true,
  bitrateInKbps: true,
});

export type FileMinimum = z.infer<typeof FileMinimumSchema>;
