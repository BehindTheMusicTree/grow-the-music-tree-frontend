"use client";

import { useState, type MouseEvent } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { Pagination, PanelSection, Skeleton } from "@behindthemusictree/ui";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { SongDetailedSchema, libraryEndpoints, songUnplayableReason, useTrackList, type SongDetailed } from "@behindthemusictree/app-kit/genre-tree";
import { TrackItem } from "@behindthemusictree/app-kit-ui/genre-tree";
import { PaginatedResponseSchema, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { renderArtistLink } from "./renderArtistLink";

const SongPageSchema = PaginatedResponseSchema(SongDetailedSchema);

const SORTS = [
  { ordering: "title", label: "Title" },
  { ordering: "-albumYear", label: "Year" },
] as const;
type Ordering = (typeof SORTS)[number]["ordering"];

export default function ArtistSongs({ artist }: { artist: { uuid: string; name: string } }) {
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<Ordering>("title");
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { playNewTrackListFromArtist } = useTrackList<SongDetailed>();
  const { playerTrackObject } = usePlayer();
  const { data, isPending, isError } = useQueryWithParse({
    queryKey: ["referenceSongs", "artist", artist.uuid, ordering, page],
    queryFn: () =>
      fetch(libraryEndpoints.reference.songs.list(), true, false, undefined, {
        artist: artist.uuid,
        ordering,
        page,
      }),
    schema: SongPageSchema,
    placeholderData: keepPreviousData,
    context: "ArtistSongs",
  });

  const play = (startSongUuid?: string) =>
    playNewTrackListFromArtist({ uuid: artist.uuid, name: artist.name }, "reference", {
      ordering,
      startSongUuid,
    });

  // TrackItem's own play control (`.track-position-play-pause`, a div) plays from whatever list is active; a click on a track that isn't
  // loaded yet must queue this artist's list instead.
  const handleRowClickCapture = (event: MouseEvent, song: SongDetailed) => {
    if (!(event.target instanceof Element) || !event.target.closest(".track-position-play-pause")) return;
    if (playerTrackObject?.track.id === song.uuid || songUnplayableReason(song) !== null) return;
    event.stopPropagation();
    void play(song.uuid);
  };

  return (
    <PanelSection title="Songs">
      {isPending ? (
        <Skeleton className="h-14" aria-busy="true" />
      ) : isError ? (
        <p className="text-red-600">Could not load songs.</p>
      ) : data.results.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">No songs yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={() => void play()}
              className="flex w-fit items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded-full hover:bg-gray-700"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Play all
            </button>
            <div role="group" aria-label="Sort songs by" className="flex gap-1 text-xs">
              {SORTS.map((sort) => (
                <button
                  key={sort.ordering}
                  type="button"
                  aria-pressed={ordering === sort.ordering}
                  onClick={() => {
                    setOrdering(sort.ordering);
                    setPage(1);
                  }}
                  className="px-2.5 py-0.5 text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-muted)] aria-pressed:bg-gray-900 aria-pressed:text-white"
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="overflow-hidden mb-2 bg-zinc-950 rounded-lg">
            {data.results.map((song, index) => (
              <li key={song.uuid} onClickCapture={(event) => handleRowClickCapture(event, song)}>
                <TrackItem
                  track={song}
                  position={(page - 1) * data.pageSize + index + 1}
                  renderArtistLink={renderArtistLink}
                />
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </PanelSection>
  );
}
