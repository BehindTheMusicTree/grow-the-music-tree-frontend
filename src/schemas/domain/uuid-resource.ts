import { z } from "zod";

export const UuidResourceSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidResource = z.infer<typeof UuidResourceSchema>;
