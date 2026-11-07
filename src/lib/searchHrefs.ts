import { REGION_MAP_HREF } from "@lib/constants/routes";

/** The tree keys `?genre=` by genre playlist uuid; null when the genre has no playlist in the tree. */
export const treeGenreHref = (genrePlaylistUuid: string | null) =>
  genrePlaylistUuid ? `/?genre=${encodeURIComponent(genrePlaylistUuid)}` : null;

export const mapRegionHref = (regionId: string) => `${REGION_MAP_HREF}?region=${encodeURIComponent(regionId)}`;

/** The map keys `?genre=` by criteria uuid, inside the region whose panel lists it. */
export const mapGenreHref = (regionId: string, genreUuid: string) => `${mapRegionHref(regionId)}&genre=${encodeURIComponent(genreUuid)}`;
