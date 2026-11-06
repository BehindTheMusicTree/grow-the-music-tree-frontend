import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { updateUrlQuery, type UrlQueryMethod } from "@lib/urlQuery";

export const PATH_PARAM = "path";
export const REGION_PARAM = "region";
export const GENRE_PARAM = "genre";

export type RegionMapUrlState = { path: string[]; region: string | null; genre: string | null };
export type RegionMapUrlUpdate = Partial<RegionMapUrlState>;

/** Drill path, selected region and panel genre of the map, kept in the query string so they can be shared. */
export function useRegionMapUrlState() {
  const searchParams = useSearchParams();

  const rawPath = searchParams.get(PATH_PARAM);
  const state: RegionMapUrlState = {
    path: rawPath ? rawPath.split("/").filter(Boolean) : [],
    region: searchParams.get(REGION_PARAM),
    genre: searchParams.get(GENRE_PARAM),
  };

  const update = useCallback((changes: RegionMapUrlUpdate, method: UrlQueryMethod = "push") => {
    updateUrlQuery((params) => {
      const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key));
      if (changes.path !== undefined) set(PATH_PARAM, changes.path.join("/"));
      if (changes.region !== undefined) set(REGION_PARAM, changes.region);
      if (changes.genre !== undefined) set(GENRE_PARAM, changes.genre);
    }, method);
  }, []);

  return { state, update };
}
