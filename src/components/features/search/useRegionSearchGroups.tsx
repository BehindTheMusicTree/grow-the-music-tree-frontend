import { useMemo } from "react";
import { SEARCH_QUERY_MIN_LENGTH, rankByName } from "@behindthemusictree/app-kit/genre-tree";
import { searchStatus, type SearchGroup } from "@behindthemusictree/app-kit-ui/genre-tree";
import type { Region } from "@schemas/api/region-map";
import type { RegionGenreEntry } from "./useRegionGenreIndex";

const MAX_LOCAL_RESULTS = 8;

const KIND_LABEL: Record<Region["kind"], string> = {
  country: "Country",
  admin_unit: "Region",
  zone: "Zone",
  city: "City",
};

type Source = { ready: boolean; isError: boolean };

const Option = ({ name, detail }: { name: string; detail?: string }) => (
  <span className="flex min-w-0 flex-col">
    <span className="truncate">{name}</span>
    {detail && <span className="truncate text-xs text-gray-500">{detail}</span>}
  </span>
);

/** Places from the region index, ranked like the API's typeahead. Undefined until the query is long enough. */
export function usePlaceSearchGroup(
  regions: ReadonlyMap<string, Region> | null,
  source: Source,
  text: string,
  onSelect: (region: Region) => void,
): SearchGroup | undefined {
  const query = text.trim();
  return useMemo(() => {
    if (query.length < SEARCH_QUERY_MIN_LENGTH) return undefined;
    const hits = regions ? rankByName(Array.from(regions.values()), query, (region) => region.name).slice(0, MAX_LOCAL_RESULTS) : [];
    return {
      key: "places",
      label: "Places",
      loading: !source.ready && !source.isError,
      status: searchStatus({ isError: source.isError, settled: source.ready }, hits.length, "places"),
      items: hits.map((region) => ({
        key: region.id,
        content: (
          <Option
            name={region.name}
            detail={[KIND_LABEL[region.kind], region.parentId ? regions?.get(region.parentId)?.name : undefined].filter(Boolean).join(" · ")}
          />
        ),
        onSelect: () => onSelect(region),
      })),
    };
  }, [query, regions, source.ready, source.isError, onSelect]);
}

/** Overviews and regional, tradition and canonical genres linked to a region, ranked locally. */
export function useRegionGenreSearchGroup(
  entries: readonly RegionGenreEntry[],
  source: Source,
  text: string,
  onSelect: (entry: RegionGenreEntry) => void,
): SearchGroup | undefined {
  const query = text.trim();
  return useMemo(() => {
    if (query.length < SEARCH_QUERY_MIN_LENGTH) return undefined;
    const hits = rankByName(
      entries,
      query,
      (entry) => entry.genre.name,
      (entry) => entry.genre.viewsCount,
    ).slice(0, MAX_LOCAL_RESULTS);
    return {
      key: "region-genres",
      label: "Genres",
      loading: !source.ready && !source.isError,
      status: searchStatus({ isError: source.isError, settled: source.ready }, hits.length, "genres"),
      items: hits.map((entry) => ({
        key: entry.genre.uuid,
        content: (
          <Option
            name={entry.genre.name}
            detail={`${entry.region.name}${entry.genre.isUmbrella ? " · umbrella" : ""}`}
          />
        ),
        onSelect: () => onSelect(entry),
      })),
    };
  }, [query, entries, source.ready, source.isError, onSelect]);
}
