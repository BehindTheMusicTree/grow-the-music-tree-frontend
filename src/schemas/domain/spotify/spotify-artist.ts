import { z } from "zod";

export const SpotifyArtistDetailedSchema = z.object({
  spotifyId: z.string(),
  name: z.string(),
  popularity: z.number(),
  spotifyLink: z.string().url(),
  genres: z.array(z.string()),
  images: z.array(z.string()),
});

export type SpotifyArtist = z.infer<typeof SpotifyArtistDetailedSchema>;

export const SpotifyArtistSimpleSchema = z.object({
  spotifyId: z.string(),
  name: z.string(),
  spotifyLink: z.string().url(),
  genres: z.array(z.string()),
});

export type SpotifyArtistSimple = z.infer<typeof SpotifyArtistSimpleSchema>;
