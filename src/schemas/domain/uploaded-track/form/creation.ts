import { z } from "zod";
import { UploadedTrackFormSchema } from "./form";

export const UploadedTrackCreationSchema = UploadedTrackFormSchema.extend({
  file: z.instanceof(File),
});

export type UploadedTrackCreationValues = z.infer<typeof UploadedTrackCreationSchema>;
