import { z } from "zod";

export const UuidResourceSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type UuidResource = z.infer<typeof UuidResourceSchema>; 