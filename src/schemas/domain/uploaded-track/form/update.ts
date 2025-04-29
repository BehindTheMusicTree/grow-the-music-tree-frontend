import { z } from "zod";
import { UploadedTrackFormSchema } from "../form";

export const UploadedTrackUpdateSchema = UploadedTrackFormSchema.extend({
  archived: z.boolean().optional(),
});

export type UploadedTrackUpdateValues = z.infer<typeof UploadedTrackUpdateSchema>;
