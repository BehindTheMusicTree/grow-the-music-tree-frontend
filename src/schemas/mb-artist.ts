import { z } from "zod";

export const MbArtistDetailedSchema = z.object({
  musicbrainzId: z.string().uuid(),
  name: z.string(),
  musicbrainzLink: z.string().url(),
});

export type MusicbrainzArtistDetailed = z.infer<typeof MbArtistDetailedSchema>;
