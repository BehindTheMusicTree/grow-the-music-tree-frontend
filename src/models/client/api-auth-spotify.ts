import { z } from "zod";
import { SpotifyUserSchema } from "@/models/domain/user/spotify";

export const ApiAuthTokenSpotifySchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string().datetime(),
  spotifyUser: SpotifyUserSchema,
});

export type AuthToken = z.infer<typeof ApiAuthTokenSpotifySchema>;
