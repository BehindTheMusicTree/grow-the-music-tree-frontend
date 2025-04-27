import { z } from "zod";
import { SpotifyUserDetailedSchema } from "@schemas/domain/spotify-user";

export const ApiAuthTokenSpotifySchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.string().datetime(),
  spotifyUser: SpotifyUserDetailedSchema,
});

export type ApiAuthTokenSpotify = z.infer<typeof ApiAuthTokenSpotifySchema>;
