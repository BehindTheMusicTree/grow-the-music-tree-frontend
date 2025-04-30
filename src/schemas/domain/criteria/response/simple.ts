import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";
import { CriteriaMinimumSchema } from "./minimum";

export const CriteriaSimpleSchema = UuidResourceSchema.extend({
  name: z.string(),
  parent: CriteriaMinimumSchema.nullable(),
  createdOn: z.string().datetime(),
});

export type CriteriaSimple = z.infer<typeof CriteriaSimpleSchema>;
