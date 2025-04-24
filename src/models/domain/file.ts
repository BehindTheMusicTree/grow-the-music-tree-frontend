import { z } from "zod";
import { MbRecordingDetailedSchema } from "./mb-recording";

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
  musicbrainzRecording: MbRecordingDetailedSchema,
  musicbrainzRecordingMissingCause: z.string().optional(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type FileDetailed = z.infer<typeof FileDetailedSchema>;
