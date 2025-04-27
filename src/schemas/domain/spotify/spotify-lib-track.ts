import { z } from "zod";
import { SpotifyArtistSimpleSchema } from "./spotify-artist";

export const SpotifyLibTrackDetailedSchema = z.object({
  spotifyId: z.string(),
  name: z.string(),
  durationMs: z.number(),
  durationStrInHourMinSec: z.string(),
  popularity: z.number().nullable(),
  spotifyLink: z.string().url(),
  album: z.string(),
  previewUrl: z.string().url().optional(),
  explicit: z.boolean(),
  spotifyArtists: z.array(SpotifyArtistSimpleSchema),
  isRemoved: z.boolean(),
  genres: z.array(z.string()),
});

export type SpotifyLibTrackDetailed = z.infer<typeof SpotifyLibTrackDetailedSchema>;

export const SpotifyLibTrackSimpleSchema = z.object({
  spotifyId: z.string(),
  name: z.string(),
  durationStrInHourMinSec: z.string(),
  spotifyLink: z.string().url(),
  album: z.string(),
  spotifyArtists: z.array(SpotifyArtistSimpleSchema),
  isRemoved: z.boolean(),
  genres: z.array(z.string()),
});

export type SpotifyLibTrackSimple = z.infer<typeof SpotifyLibTrackSimpleSchema>;
