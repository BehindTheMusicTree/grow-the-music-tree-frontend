import { z } from "zod";

export const AudioMetadataDetailedSchema = z.object({
  technicalInfo: z.unknown(),
  unifiedMetadata: z.unknown(),
  metadataFormat: z.unknown(),
  headers: z.unknown(),
  rawMetadata: z.unknown(),
  formatPriorities: z.unknown(),
});

export type AudioMetadataDetailed = z.infer<typeof AudioMetadataDetailedSchema>;
