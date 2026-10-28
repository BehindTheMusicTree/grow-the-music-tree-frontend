import { z } from "zod";

// Standalone (not built on app-kit's ArtistMinimumSchema): app-kit's barrels create React contexts
// at import, which breaks the server component that fetches this.
const ArtistRefSchema = z.object({ uuid: z.string().uuid(), name: z.string() });

const MembershipSchema = z.object({
  artist: ArtistRefSchema,
  beginYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  ended: z.boolean(),
  roles: z.array(z.string()),
});

export const ARTIST_LINK_KINDS = [
  "official",
  "wikipedia",
  "wikidata",
  "spotify",
  "youtube",
  "bandcamp",
  "soundcloud",
  "discogs",
  "social",
] as const;

export const ArtistImageSchema = z.object({
  url: z.string().url(),
  pageUrl: z.string().url(),
  author: z.string().nullable(),
  license: z.string(),
  licenseUrl: z.string().url().nullable(),
});

export const ArtistDetailedSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  musicbrainzArtistId: z.string().uuid().nullable(),
  type: z.enum(["person", "group", "orchestra", "choir", "character", "other"]).nullable(),
  country: z.string().nullable(),
  beginYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  ended: z.boolean(),
  links: z.array(z.object({ kind: z.enum(ARTIST_LINK_KINDS), url: z.string() })),
  members: z.array(MembershipSchema),
  memberOf: z.array(MembershipSchema),
  albums: z.array(
    z.object({
      uuid: z.string().uuid(),
      name: z.string(),
      year: z.string().nullable(),
      primaryType: z.string().nullable(),
      secondaryTypes: z.array(z.string()),
    }),
  ),
  tracksCount: z.number().int(),
  image: ArtistImageSchema.nullable(),
});

export type ArtistImage = z.infer<typeof ArtistImageSchema>;
export type ArtistDetailed = z.infer<typeof ArtistDetailedSchema>;
export type ArtistMembership = ArtistDetailed["members"][number];
export type ArtistLink = ArtistDetailed["links"][number];
export type ArtistAlbum = ArtistDetailed["albums"][number];
