import { z } from "zod";

export const SpotifyUserDetailedSchema = z.object({
  spotify_id: z.string(),
  display_name: z.string(),
  email: z.string(),
  country: z.string(),
  product: z.string(),
  images: z.array(
    z.object({
      url: z.string(),
      width: z.number(),
      height: z.number(),
    })
  ),
  followers: z.object({
    href: z.string().nullable(),
    total: z.number(),
  }),
  href: z.string(),
  id: z.string(),
  type: z.string(),
  uri: z.string(),
});

export type SpotifyUserDetailed = z.infer<typeof SpotifyUserDetailedSchema>;
