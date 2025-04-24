import { z } from "zod";
import { PlaylistSchema } from "./playlist";

export const GenrePlaylistSchema = PlaylistSchema.extend({
  genre_id: z.string().uuid(),
  max_tracks: z.number().min(1),
});

export type GenrePlaylist = z.infer<typeof GenrePlaylistSchema>; 