import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { updateUrlQuery, type UrlQueryMethod } from "@lib/urlQuery";

export const AT_PARAM = "at";
/** The drill path of the former level-based map, read only to frame old shared links. */
export const LEGACY_PATH_PARAM = "path";
export const REGION_PARAM = "region";
export const GENRE_PARAM = "genre";

export type Camera = { lng: number; lat: number; zoom: number };

export type RegionMapUrlState = {
  at: Camera | null;
  region: string | null;
  genre: string | null;
  legacyPath: string[];
};
export type RegionMapUrlUpdate = Partial<Omit<RegionMapUrlState, "legacyPath">> & { legacyPath?: null };

const MAX_CAMERA_ZOOM = 24;

/** `lng,lat,zoom`, or null when any part is missing or out of range. */
export function parseCamera(raw: string | null): Camera | null {
  if (!raw) return null;
  const parts = raw.split(",");
  if (parts.length !== 3 || parts.some((part) => part.trim() === "")) return null;
  const [lng, lat, zoom] = parts.map(Number);
  if (![lng, lat, zoom].every(Number.isFinite)) return null;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90 || zoom < 0 || zoom > MAX_CAMERA_ZOOM) return null;
  return { lng, lat, zoom };
}

// Four decimals locate a point to about 10 m; two keep the zoom well under a visible step.
const round = (value: number, decimals: number) => Number(value.toFixed(decimals));

export function serializeCamera({ lng, lat, zoom }: Camera): string {
  return `${round(lng, 4)},${round(lat, 4)},${round(zoom, 2)}`;
}

/** Camera, selected region and panel genre of the map, kept in the query string so they can be shared. */
export function useRegionMapUrlState() {
  const searchParams = useSearchParams();

  const rawPath = searchParams.get(LEGACY_PATH_PARAM);
  const state: RegionMapUrlState = {
    at: parseCamera(searchParams.get(AT_PARAM)),
    region: searchParams.get(REGION_PARAM),
    genre: searchParams.get(GENRE_PARAM),
    legacyPath: rawPath ? rawPath.split("/").filter(Boolean) : [],
  };

  const update = useCallback((changes: RegionMapUrlUpdate, method: UrlQueryMethod = "push") => {
    updateUrlQuery((params) => {
      const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key));
      if (changes.at !== undefined) set(AT_PARAM, changes.at && serializeCamera(changes.at));
      if (changes.region !== undefined) set(REGION_PARAM, changes.region);
      if (changes.genre !== undefined) set(GENRE_PARAM, changes.genre);
      if (changes.legacyPath === null) params.delete(LEGACY_PATH_PARAM);
    }, method);
  }, []);

  return { state, update };
}
