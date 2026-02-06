import { z } from "zod";
import { UploadedTrackDetailedSchema } from "./detailed";

export const UploadedTrackMinimumSchema = UploadedTrackDetailedSchema.pick({
  uuid: true,
  title: true,
  artists: true,
});

export type UploadedTrackMinimum = z.infer<typeof UploadedTrackMinimumSchema>;
