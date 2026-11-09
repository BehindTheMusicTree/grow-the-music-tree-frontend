import { REGION_MAP_HREF } from "@lib/constants/routes";

/** Both visualizations identify genre entities independently of their playlists. */
export const treeGenreHref = (genreUuid: string | null) =>
  genreUuid ? `/?genre=${encodeURIComponent(genreUuid)}` : null;

/** The map frames `?region=` by Wikidata id and keys `?genre=` by genre uuid. */
export const mapRegionHref = (regionId: string, genreUuid: string | null = null) => {
  const params = new URLSearchParams({ region: regionId });
  if (genreUuid) params.set("genre", genreUuid);
  return `${REGION_MAP_HREF}?${params.toString()}`;
};
