import { z } from "zod";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";

export const GenreMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type GenreMinimum = z.infer<typeof GenreMinimumSchema>;
