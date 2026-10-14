"use client";

import { useState, type MouseEvent } from "react";
import { Play } from "lucide-react";
import { Pagination } from "@behindthemusictree/ui";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import {
  RecordingDetailedSchema,
  TrackItem,
  libraryEndpoints,
  recordingUnplayableReason,
  useTrackList,
  type RecordingDetailed,
} from "@behindthemusictree/app-kit/genre-tree";
import { PaginatedResponseSchema, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import ArtistSection from "./ArtistSection";
import { renderArtistLink } from "./renderArtistLink";

const RecordingPageSchema = PaginatedResponseSchema(RecordingDetailedSchema);

export default function ArtistTracks({ artist }: { artist: { uuid: string; name: string } }) {
  const [page, setPage] = useState(1);
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { playNewTrackList } = useTrackList<RecordingDetailed>();
  const { playerTrackObject } = usePlayer();
  const { data, isPending, isError } = useQueryWithParse({
    queryKey: ["referenceRecordings", "artist", artist.uuid, page],
    queryFn: () =>
      fetch(libraryEndpoints.reference.recordings.list(), true, false, undefined, {
        artist: artist.uuid,
        ordering: "title",
        page,
      }),
    schema: RecordingPageSchema,
    context: "ArtistTracks",
  });

  // ponytail: queues the current page only; fetch every page if "play all" must span pages.
  const playable = data?.results.filter((recording) => recordingUnplayableReason(recording) === null) ?? [];
  const play = (startUuid: string) =>
    playNewTrackList(playable, startUuid, { type: "artist", uuid: artist.uuid, name: artist.name }, "reference");

  // TrackItem's own play button plays from whatever list is active; a click on a track that isn't
  // loaded yet must queue this artist's list instead.
  const handleRowClickCapture = (event: MouseEvent, recording: RecordingDetailed) => {
    if (!(event.target instanceof Element) || !event.target.closest("button")) return;
    if (playerTrackObject?.track.id === recording.uuid) return;
    event.stopPropagation();
    play(recording.uuid);
  };

  return (
    <ArtistSection title="Tracks">
      {isPending ? (
        <div className="h-14 animate-pulse rounded bg-gray-200" aria-busy="true" />
      ) : isError ? (
        <p className="text-red-600">Could not load tracks.</p>
      ) : data.results.length === 0 ? (
        <p className="text-gray-600">No tracks yet.</p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => play(playable[0].uuid)}
            disabled={playable.length === 0}
            className="flex w-fit items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Play all
          </button>
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
