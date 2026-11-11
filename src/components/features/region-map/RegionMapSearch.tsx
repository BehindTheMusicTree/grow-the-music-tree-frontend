"use client";

import { useCallback, useMemo, useState } from "react";
import { useRegionGenreLexicon, useFetchGenreDetail, useArtist, useSong, useSearchQueryState, type GenreUuid } from "@behindthemusictree/app-kit/genre-tree";
import { SearchBox, useArtistSearchGroup, useGenreRemoteSearchGroup, useSongSearchGroup } from "@behindthemusictree/app-kit-ui/genre-tree";
import { useRegionGenreIndex } from "@components/features/search/useRegionGenreIndex";
import { usePlaceSearchGroup, useRegionGenreSearchGroup } from "@components/features/search/useRegionSearchGroups";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import type { Region, RegionMapIndex } from "@schemas/api/region-map";
import { useRegionOverview } from "./useRegionOverview";

type Props = {
  index: RegionMapIndex;
  regions: ReadonlyMap<string, Region>;
  /** Opens the region (and genre) in the panel and frames the region. */
  onPick: (regionId: string | null, genreUuid: GenreUuid | null) => void;
  onPickArtist: (artistUuid: string) => void;
  onPickSong: (songUuid: string) => void;
  selectedRegion: Region | undefined;
  selectedGenreUuid: string | null;
  selectedArtistUuid: string | null;
  selectedSongUuid: string | null;
  /** Called by the clear button, shown only while a panel is open. */
  onClosePanel: () => void;
  className?: string;
};

/** Places, region genres, other genres, artists and songs in one box. The lexicon loads on the first focus. */
export default function RegionMapSearch({ index, regions, onPick, onPickArtist, onPickSong, selectedRegion, selectedGenreUuid, selectedArtistUuid, selectedSongUuid, onClosePanel, className }: Props) {
  const [focused, setFocused] = useState(false);
  const lexicon = useRegionGenreLexicon(getGrowBackendBaseUrl, focused);
  const entries = useRegionGenreIndex(index, lexicon.entries);
  const source = { ready: !lexicon.isPending, isError: lexicon.isError };
  const lexiconUuids = useMemo(() => new Set(entries.map((entry) => entry.genre.uuid)), [entries]);

  const genreDetail = useFetchGenreDetail(selectedGenreUuid, "reference", getGrowBackendBaseUrl);
  const selectedGenre = genreDetail.status === "success" ? genreDetail.genre : undefined;
  // The panel shows a genre first, then a song, then an artist, then the region.
  const songOpen = selectedGenreUuid === null && selectedSongUuid !== null;
  const artistOpen = selectedGenreUuid === null && !songOpen && selectedArtistUuid !== null;
  const song = useSong(songOpen ? selectedSongUuid : null, getGrowBackendBaseUrl);
  const artist = useArtist(artistOpen ? selectedArtistUuid : null, getGrowBackendBaseUrl);
  const regionOverview = useRegionOverview(selectedGenreUuid === null && !songOpen && !artistOpen ? selectedRegion : undefined);
  let selectedName: string | null;
  if (selectedGenreUuid !== null) selectedName = selectedGenre?.name ?? null;
  else if (songOpen) selectedName = song.status === "success" ? song.song.title : null;
  else if (artistOpen) selectedName = artist.status === "success" ? artist.artist.name : null;
  else selectedName = regionOverview.panelName;
  const panelOpen = selectedRegion !== undefined || selectedGenreUuid !== null || songOpen || artistOpen;
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
  const artists = useArtistSearchGroup(getGrowBackendBaseUrl, text, (picked) => onPickArtist(picked.uuid), focused);
  const songs = useSongSearchGroup(getGrowBackendBaseUrl, text, (picked) => onPickSong(picked.uuid), focused);

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
