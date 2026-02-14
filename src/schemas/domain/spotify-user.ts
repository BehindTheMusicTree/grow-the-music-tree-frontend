import { z } from "zod";

export type SpotifyUserDetailed = {
  id: string;
  spotify_id: string;
  display_name: string | null;
  email: string | null;
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
  images: z.array(SpotifyImageSchema).optional(),
  followers: SpotifyFollowersSchema.optional(),
  href: z.string().optional(),
  type: z.string().optional(),
  uri: z.string().optional(),
});

const spotifyUserTransform = (raw: z.infer<typeof SpotifyUserDetailedRawSchema>): SpotifyUserDetailed => {
  const f = raw.followers;
  const followers: { href: string | null; total: number } = {
    href: f?.href ?? null,
    total: f?.total ?? 0,
  };
  return {
    id: raw.id ?? raw.spotify_id ?? "",
    spotify_id: raw.spotify_id ?? raw.id ?? "",
    display_name: raw.display_name ?? null,
    email: raw.email ?? null,
    images: raw.images ?? [],
    followers,
    href: raw.href ?? "",
    type: raw.type ?? "user",
    uri: raw.uri ?? "",
  };
};

export const SpotifyUserDetailedSchema = z
  .union([
    z.object({ spotify_user: SpotifyUserDetailedRawSchema }).transform((r) => spotifyUserTransform(r.spotify_user)),
    SpotifyUserDetailedRawSchema.transform(spotifyUserTransform),
  ]) as z.ZodType<SpotifyUserDetailed>;

const ApiSpotifyUserImageSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const ApiSpotifyUserItemSchema = z.object({
  spotifyId: z.string().optional(),
  email: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  href: z.string().optional(),
  type: z.string().optional(),
  uri: z.string().optional(),
  images: z.array(ApiSpotifyUserImageSchema).optional(),
  followers: z
    .object({
      href: z.string().nullable().optional(),
      total: z.number().optional(),
    })
    .optional(),
  spotifyProfile: z
    .object({
      id: z.string().optional(),
      displayName: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .optional(),
});

const ApiSpotifyUserListResponseSchema = z.object({
  results: z.array(ApiSpotifyUserItemSchema),
});

function apiItemToSpotifyUserDetailed(item: z.infer<typeof ApiSpotifyUserItemSchema>): SpotifyUserDetailed {
  const id = item.spotifyId ?? item.spotifyProfile?.id ?? "";
  const followers = item.followers;
  const followersNormalized: { href: string | null; total: number } = {
    href: followers?.href ?? null,
    total: followers?.total ?? 0,
  };
  return {
    id,
    spotify_id: id,
    display_name: item.displayName ?? item.spotifyProfile?.displayName ?? null,
    email: item.email ?? item.spotifyProfile?.email ?? null,
    images: item.images ?? [],
    followers: followersNormalized,
    href: item.href ?? "",
    type: item.type ?? "user",
    uri: item.uri ?? "",
  };
}

export const SpotifyUserFromApiResponseSchema = z
  .object({
    results: z.array(ApiSpotifyUserItemSchema),
  })
  .transform((data) => {
    const first = data.results[0];
    if (!first) {
      return apiItemToSpotifyUserDetailed({});
    }
    return apiItemToSpotifyUserDetailed(first);
  }) as unknown as z.ZodType<SpotifyUserDetailed>;
