import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const GenreSchema = UuidResourceSchema.extend({
  name: z.string(),
  description: z.string().nullable(),
});

export type Genre = z.infer<typeof GenreSchema>; 