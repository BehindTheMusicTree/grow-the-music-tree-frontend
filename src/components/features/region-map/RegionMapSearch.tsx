"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegionGenreLexicon } from "@behindthemusictree/app-kit/genre-tree";
import { SearchBox, useArtistSearchGroup, useGenreRemoteSearchGroup, useSongSearchGroup } from "@behindthemusictree/app-kit-ui/genre-tree";
import { useRegionGenreIndex } from "@components/features/search/useRegionGenreIndex";
import { usePlaceSearchGroup, useRegionGenreSearchGroup } from "@components/features/search/useRegionSearchGroups";
import { PATHS } from "@lib/constants/routes";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { treeGenreHref } from "@lib/searchHrefs";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";

type Props = {
  index: RegionMapIndex;
  regions: ReadonlyMap<string, Region>;
  /** Opens the region (and genre) in the panel and frames the region. */
  onPick: (regionId: string, genreUuid: string | null) => void;
  className?: string;
};

/** Places, region genres, other genres, artists and songs in one box. The lexicon loads on the first focus. */
export default function RegionMapSearch({ index, regions, onPick, className }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const lexicon = useRegionGenreLexicon(getGrowBackendBaseUrl, focused);
  const entries = useRegionGenreIndex(index, lexicon.entries);
  const source = { ready: !lexicon.isPending, isError: lexicon.isError };
  const lexiconUuids = useMemo(() => new Set(lexicon.entries.map((entry) => entry.uuid)), [lexicon.entries]);

  const places = usePlaceSearchGroup(regions, { ready: true, isError: false }, text, useCallback((region: Region) => onPick(region.id, null), [onPick]));
  const regionGenres = useRegionGenreSearchGroup(entries, source, text, useCallback((entry) => onPick(entry.region.id, entry.genre.uuid), [onPick]));
  const otherGenres = useGenreRemoteSearchGroup(
    getGrowBackendBaseUrl,
    text,
    (genre) => {
      const href = treeGenreHref(genre.genrePlaylistUuid);
      if (href) router.push(href);
    },
    {
      key: "other-genres",
      label: "Other genres",
      enabled: focused && source.ready,
      filter: (genre) => !lexiconUuids.has(genre.uuid) && genre.genrePlaylistUuid !== null,
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
      value={text}
      onValueChange={setText}
      onClear={() => setText("")}
      groups={groups}
      onPicked={() => setText("")}
      onFocus={() => setFocused(true)}
    />
  );
}
