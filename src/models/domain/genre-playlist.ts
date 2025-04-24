import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/base-resource/uuid";

export const GenrePlaylistSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export type GenrePlaylist = z.infer<typeof GenrePlaylistSchema>;
