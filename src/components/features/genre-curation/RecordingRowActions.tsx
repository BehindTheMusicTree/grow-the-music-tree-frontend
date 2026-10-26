"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { genreQueryKeys, type CriteriaOverview, type TrackBase } from "@behindthemusictree/app-kit/genre-tree";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { MoveRecordingsPopup, UnlinkRecordingsPopup } from "@components/features/genre-curation/RecordingPopups";
import RecordingVideoDialog from "@components/features/genre-curation/RecordingVideoDialog";
import { useEssentialTracks } from "@hooks/curation/useEssentialTracks";

const BUTTON = "px-1 cursor-pointer hover:bg-gray-100 rounded disabled:opacity-50";

export default function RecordingRowActions({ recording }: { recording: TrackBase }) {
  const { genre, openDialog } = useGenreCuration();
  const essential = useEssentialTracks();
  const { data: overview } = useQuery<CriteriaOverview>({
    queryKey: genreQueryKeys.reference.overview(genre?.uuid ?? ""),
    queryFn: skipToken,
  });
  if (!genre) return null;

  const current = overview?.essentialTracks ?? [];
  const isEssential = current.some((track) => track.uuid === recording.uuid);
  const toggleEssential = () =>
    essential.mutate({
      uuid: genre.uuid,
      previous: current,
      tracks: isEssential
        ? current.filter((track) => track.uuid !== recording.uuid)
        : [...current, { uuid: recording.uuid, title: recording.title, artists: recording.artists }],
    });

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        aria-label={isEssential ? `Remove ${recording.title} from essential songs` : `Mark ${recording.title} essential`}
        aria-pressed={isEssential}
        disabled={!overview || essential.isPending}
        onClick={toggleEssential}
        className={BUTTON}
      >
        {isEssential ? "★" : "☆"}
      </button>
      <button
        type="button"
        aria-label={`Move ${recording.title} to another genre`}
        onClick={() => openDialog((close) => <MoveRecordingsPopup recordings={[recording.uuid]} onClose={close} />)}
        className={BUTTON}
      >
        ⇄
      </button>
      <button
        type="button"
        aria-label={`Unlink ${recording.title} from this genre`}
        onClick={() => openDialog((close) => <UnlinkRecordingsPopup recordings={[recording.uuid]} onClose={close} />)}
        className={BUTTON}
      >
        ✕
      </button>
      <button
        type="button"
        aria-label={`Edit video of ${recording.title}`}
        onClick={() => openDialog((close) => <RecordingVideoDialog recording={recording} onClose={close} />)}
        className={BUTTON}
      >
        ▶
      </button>
    </span>
  );
}
