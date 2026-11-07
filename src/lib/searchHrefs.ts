import { REGION_MAP_HREF } from "@lib/constants/routes";

/** The tree keys `?genre=` by genre playlist uuid; null when the genre has no playlist in the tree. */
export const treeGenreHref = (genrePlaylistUuid: string | null) =>
  genrePlaylistUuid ? `/?genre=${encodeURIComponent(genrePlaylistUuid)}` : null;

/** The map frames `?region=` by Wikidata id and keys `?genre=` by criteria uuid. */
export const mapRegionHref = (regionId: string, genreUuid: string | null = null) => {
  const params = new URLSearchParams({ region: regionId });
  if (genreUuid) params.set("genre", genreUuid);
  return `${REGION_MAP_HREF}?${params.toString()}`;
};
