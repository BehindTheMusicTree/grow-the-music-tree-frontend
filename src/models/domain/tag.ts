import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const TagSchema = UuidResourceSchema.extend({
  name: z.string(),
  description: z.string().nullable(),
});

export type Tag = z.infer<typeof TagSchema>; 