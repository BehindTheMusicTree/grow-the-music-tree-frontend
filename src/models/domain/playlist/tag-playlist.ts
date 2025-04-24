import { z } from "zod";
import { PlaylistSchema } from "./playlist";

export const TagPlaylistSchema = PlaylistSchema.extend({
  tag_id: z.string().uuid(),
  max_tracks: z.number().min(1),
});

export type TagPlaylist = z.infer<typeof TagPlaylistSchema>; 