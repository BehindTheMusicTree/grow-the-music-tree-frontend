import { z } from "zod";

// Standalone for the same reason as ./artist: app-kit's barrels create React contexts at import.
export const ArtistSearchSchema = z.array(
  z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    disambiguation: z.string().nullable(),
    type: z.enum(["person", "group", "orchestra", "choir", "character", "other"]).nullable(),
    country: z.string().nullable(),
    beginYear: z.number().int().nullable(),
    endYear: z.number().int().nullable(),
    matchedAlias: z.string().nullable(),
    recordingCount: z.number().int(),
  }),
);
