import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const GenreMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type GenreMinimum = z.infer<typeof GenreMinimumSchema>;
