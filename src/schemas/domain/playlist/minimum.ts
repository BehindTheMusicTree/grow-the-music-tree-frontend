import { z } from "zod";

import { UuidResourceSchema } from "@domain/uuid-resource";

export const PlaylistMinimumSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type PlaylistMinimum = z.infer<typeof PlaylistMinimumSchema>;
