"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegionGenreLexicon, useFetchGenreDetail, GenreUuidSchema, useSearchQueryState, type GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import { SearchBox, useArtistSearchGroup, useGenreRemoteSearchGroup, useSongSearchGroup } from "@behindthemusictree/app-kit-ui/genre-tree";
import { useRegionGenreIndex } from "@components/features/search/useRegionGenreIndex";
import { usePlaceSearchGroup, useRegionGenreSearchGroup } from "@components/features/search/useRegionSearchGroups";
import { PATHS } from "@lib/constants/routes";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";
import { useRegionOverview } from "./useRegionOverview";

type Props = {
  index: RegionMapIndex;
  regions: ReadonlyMap<string, Region>;
  /** Opens the region (and genre) in the panel and frames the region. */
  onPick: (regionId: string | null, genreUuid: GenreUuid | null) => void;
  selectedRegion: Region | undefined;
  selectedGenreUuid: string | null;
  /** Called by the clear button, shown only while a panel is open. */
  onClosePanel: () => void;
  className?: string;
};

/** Places, region genres, other genres, artists and songs in one box. The lexicon loads on the first focus. */
export default function RegionMapSearch({ index, regions, onPick, selectedRegion, selectedGenreUuid, onClosePanel, className }: Props) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const lexicon = useRegionGenreLexicon(getGrowBackendBaseUrl, focused);
  const entries = useRegionGenreIndex(index, lexicon.entries);
  const source = { ready: !lexicon.isPending, isError: lexicon.isError };
  const lexiconUuids = useMemo(() => new Set(entries.map((entry) => entry.genre.uuid)), [entries]);

  const parsedGenre = GenreUuidSchema.safeParse(selectedGenreUuid);
  const { data: selectedGenre } = useFetchGenreDetail(parsedGenre.success ? parsedGenre.data : null, "reference", getGrowBackendBaseUrl);
  const regionOverview = useRegionOverview(selectedGenreUuid === null ? selectedRegion : undefined);
  const selectedName = selectedGenreUuid === null ? regionOverview.panelName : (selectedGenre?.name ?? null);
  const panelOpen = selectedRegion !== undefined || selectedGenreUuid !== null;
  const { query, setQuery, isTyping, clear } = useSearchQueryState({ selectedName, onClear: onClosePanel });
  const text = isTyping ? query : "";
  const places = usePlaceSearchGroup(regions, { ready: true, isError: false }, text, useCallback((region: Region) => onPick(region.id, null), [onPick]));
  const regionGenres = useRegionGenreSearchGroup(entries, source, text, useCallback((entry) => onPick(entry.region.id, entry.genre.uuid), [onPick]));
  const otherGenres = useGenreRemoteSearchGroup(
    getGrowBackendBaseUrl,
    text,
    (genre) => onPick(null, genre.uuid),
    {
      key: "other-genres",
      label: "Other genres",
      enabled: focused,
      filter: (genre) => !lexiconUuids.has(genre.uuid),
    },
  );
  const artists = useArtistSearchGroup(getGrowBackendBaseUrl, text, (artist) => router.push(PATHS.ARTIST(artist.uuid)), focused);
  const songs = useSongSearchGroup(getGrowBackendBaseUrl, text, (song) => router.push(PATHS.SONG(song.uuid)), focused);

  const groups = [places, regionGenres, otherGenres, artists, songs].filter((group) => group !== undefined);

  return (
    <SearchBox
      className={className}
      label="Search the map"
      placeholder="Search places, genres, artists, songs"
      value={query}
      onValueChange={setQuery}
      onClear={panelOpen ? clear : undefined}
      clearLabel="Close panel"
      groups={groups}
      onPicked={() => setQuery(selectedName ?? "")}
      onFocus={() => setFocused(true)}
    />
  );
}
