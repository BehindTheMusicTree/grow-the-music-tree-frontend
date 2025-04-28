import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";

export const CriteriaPlaylistMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type CriteriaPlaylistDetailed = z.infer<typeof CriteriaPlaylistMinimumSchema>;
