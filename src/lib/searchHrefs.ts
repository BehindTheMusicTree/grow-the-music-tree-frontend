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

/** Switching between the tree and the map keeps the open genre, artist and song; every other parameter belongs to one view. */
export const viewSwitchHref = (target: "/" | typeof REGION_MAP_HREF, searchParams: URLSearchParams) => {
  const carried = new URLSearchParams();
  for (const key of ["genre", "artist", "song"]) {
    const value = searchParams.get(key);
    if (value) carried.set(key, value);
  }
  const query = carried.toString();
  return query ? `${target}?${query}` : target;
};

/** An artist or song opened from the map keeps the camera and region, and replaces the other panel entities. */
export const mapEntityHref = (kind: "artist" | "song", uuid: string, searchParams: URLSearchParams) => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("genre");
  params.delete("artist");
  params.delete("song");
  params.set(kind, uuid);
  return `${REGION_MAP_HREF}?${params.toString()}`;
};
