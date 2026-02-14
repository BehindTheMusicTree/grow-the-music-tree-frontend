import { z } from "zod";
import { MbRecordingDetailedSchema } from "@schemas/domain/mb/mb-recording";

export const FileDetailedSchema = z.object({
  filename: z.string(),
  extension: z.string(),
  md5HasBeenCorrected: z.boolean(),
  durationInSec: z.number(),
  durationStrInHourMinSec: z.string(),
  fingerprintMissingCause: z.string().nullable().optional(),
  sizeInBytes: z.number(),
  sizeInKo: z.number(),
  sizeInMo: z.number(),
  bitrateInKbps: z.number(),
  musicbrainzRecording: MbRecordingDetailedSchema.nullable(),
  musicbrainzRecordingMissingCause: z
    .union([z.string(), z.object({})])
    .nullable()
    .optional(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type FileDetailed = z.infer<typeof FileDetailedSchema>;
