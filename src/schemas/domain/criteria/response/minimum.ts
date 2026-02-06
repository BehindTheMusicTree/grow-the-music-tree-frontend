import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const CriteriaMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type CriteriaMinimum = z.infer<typeof CriteriaMinimumSchema>;
