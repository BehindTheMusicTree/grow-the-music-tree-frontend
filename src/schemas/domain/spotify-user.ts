import { z } from "zod";

export type SpotifyUserDetailed = {
  id: string;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
  country: string | null;
  product: string;
  images: { url: string; width?: number; height?: number }[];
  followers: { href: string | null; total: number };
  href: string;
  type: string;
  uri: string;
};

const SpotifyImageSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const SpotifyFollowersSchema = z
  .object({
    href: z.string().nullable().optional(),
    total: z.number().optional(),
  })
  .default({ href: null, total: 0 });

const SpotifyUserDetailedRawSchema = z.object({
  id: z.string().optional(),
  spotify_id: z.string().optional(),
  display_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  product: z.string().nullable().optional(),
  images: z.array(SpotifyImageSchema).optional(),
  followers: SpotifyFollowersSchema.optional(),
  href: z.string().optional(),
  type: z.string().optional(),
  uri: z.string().optional(),
});

const spotifyUserTransform = (raw: z.infer<typeof SpotifyUserDetailedRawSchema>): SpotifyUserDetailed => ({
  id: raw.id ?? raw.spotify_id ?? "",
  spotify_id: raw.spotify_id ?? raw.id ?? "",
  display_name: raw.display_name ?? null,
  email: raw.email ?? null,
  country: raw.country ?? null,
  product: raw.product ?? "free",
  images: raw.images ?? [],
  followers: raw.followers ?? { href: null, total: 0 },
  href: raw.href ?? "",
  type: raw.type ?? "user",
  uri: raw.uri ?? "",
});

export const SpotifyUserDetailedSchema: z.ZodType<SpotifyUserDetailed> = z
  .union([
    z.object({ spotify_user: SpotifyUserDetailedRawSchema }).transform((r) => spotifyUserTransform(r.spotify_user)),
    SpotifyUserDetailedRawSchema.transform(spotifyUserTransform),
  ]);
