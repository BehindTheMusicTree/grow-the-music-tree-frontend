import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const CrteriaMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type CriteriaMinimum = z.infer<typeof CrteriaMinimumSchema>;
