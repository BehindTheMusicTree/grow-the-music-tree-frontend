import { z } from "zod";
import { PlaylistSchema } from "./playlist";

export const ManualPlaylistSchema = PlaylistSchema.extend({
  track_ids: z.array(z.string().uuid()),
});

export type ManualPlaylist = z.infer<typeof ManualPlaylistSchema>; 