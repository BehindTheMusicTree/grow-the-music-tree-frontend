"use client";

import { useState, type MouseEvent } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { Pagination } from "@behindthemusictree/ui";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { RecordingDetailedSchema, libraryEndpoints, recordingUnplayableReason, useTrackList, type RecordingDetailed } from "@behindthemusictree/app-kit/genre-tree";
import { TrackItem } from "@behindthemusictree/app-kit-ui/genre-tree";
import { PaginatedResponseSchema, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import ArtistSection from "./ArtistSection";
import { renderArtistLink } from "./renderArtistLink";

const RecordingPageSchema = PaginatedResponseSchema(RecordingDetailedSchema);

const SORTS = [
  { ordering: "title", label: "Title" },
  { ordering: "-albumYear", label: "Year" },
] as const;
type Ordering = (typeof SORTS)[number]["ordering"];

export default function ArtistTracks({ artist }: { artist: { uuid: string; name: string } }) {
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState<Ordering>("title");
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { playNewTrackListFromArtist } = useTrackList<RecordingDetailed>();
  const { playerTrackObject } = usePlayer();
  const { data, isPending, isError } = useQueryWithParse({
    queryKey: ["referenceRecordings", "artist", artist.uuid, ordering, page],
    queryFn: () =>
      fetch(libraryEndpoints.reference.recordings.list(), true, false, undefined, {
        artist: artist.uuid,
        ordering,
        page,
      }),
    schema: RecordingPageSchema,
    placeholderData: keepPreviousData,
    context: "ArtistTracks",
  });

  const play = (startRecordingUuid?: string) =>
    playNewTrackListFromArtist({ uuid: artist.uuid, name: artist.name }, "reference", {
      ordering,
      startRecordingUuid,
    });

  // TrackItem's own play control (`.track-position-play-pause`, a div) plays from whatever list is active; a click on a track that isn't
  // loaded yet must queue this artist's list instead.
  const handleRowClickCapture = (event: MouseEvent, recording: RecordingDetailed) => {
    if (!(event.target instanceof Element) || !event.target.closest(".track-position-play-pause")) return;
    if (playerTrackObject?.track.id === recording.uuid || recordingUnplayableReason(recording) !== null) return;
    event.stopPropagation();
    void play(recording.uuid);
  };

  return (
    <ArtistSection title="Songs">
      {isPending ? (
        <div className="h-14 animate-pulse rounded bg-gray-200" aria-busy="true" />
      ) : isError ? (
        <p className="text-red-600">Could not load songs.</p>
      ) : data.results.length === 0 ? (
        <p className="text-gray-600">No songs yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void play()}
              className="flex w-fit items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 "
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Play all
            </button>
            <div role="group" aria-label="Sort songs by" className="flex gap-1 text-sm">
              {SORTS.map((sort) => (
                <button
                  key={sort.ordering}
                  type="button"
                  aria-pressed={ordering === sort.ordering}
                  onClick={() => {
                    setOrdering(sort.ordering);
                    setPage(1);
                  }}
                  className="rounded-full px-3 py-1 text-gray-700 hover:bg-gray-100 aria-pressed:bg-gray-900 aria-pressed:text-white"
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="overflow-hidden rounded-lg bg-zinc-950">
            {data.results.map((recording, index) => (
              <li key={recording.uuid} onClickCapture={(event) => handleRowClickCapture(event, recording)}>
                <TrackItem
                  track={recording}
                  position={(page - 1) * data.pageSize + index + 1}
                  renderArtistLink={renderArtistLink}
                />
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </ArtistSection>
  );
}
