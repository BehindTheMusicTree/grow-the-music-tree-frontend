"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { genreQueryKeys, type CriteriaOverview, type TrackBase } from "@behindthemusictree/app-kit/genre-tree";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { MoveSongsPopup, UnlinkSongsPopup } from "@components/features/genre-curation/SongPopups";
import SongVideoDialog from "@components/features/genre-curation/SongVideoDialog";
import { useEssentialSongs } from "@hooks/curation/useEssentialSongs";

const BUTTON = "bg-transparent px-1 py-0 text-[length:inherit] leading-none cursor-pointer hover:bg-gray-100 rounded disabled:opacity-50";

export default function SongRowActions({ song }: { song: TrackBase }) {
  const { genre, openDialog } = useGenreCuration();
  const essential = useEssentialSongs();
  const { data: overview } = useQuery<CriteriaOverview>({
    queryKey: genreQueryKeys.reference.overview(genre?.uuid ?? ""),
    queryFn: skipToken,
  });
  if (!genre) return null;

  const current = overview?.essentialSongs ?? [];
  const isEssential = current.some((track) => track.uuid === song.uuid);
  const toggleEssential = () =>
    essential.mutate({
      uuid: genre.uuid,
      previous: current,
      tracks: isEssential
        ? current.filter((track) => track.uuid !== song.uuid)
        : [...current, { uuid: song.uuid, title: song.title, artists: song.artists }],
    });

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        aria-label={isEssential ? `Remove ${song.title} from essential songs` : `Mark ${song.title} essential`}
        aria-pressed={isEssential}
        disabled={!overview || essential.isPending}
        onClick={toggleEssential}
        className={BUTTON}
      >
        {isEssential ? "★" : "☆"}
      </button>
      <button
        type="button"
        aria-label={`Move ${song.title} to another genre`}
        onClick={() => openDialog((close) => <MoveSongsPopup songs={[song.uuid]} onClose={close} />)}
        className={BUTTON}
      >
        ⇄
      </button>
      <button
        type="button"
        aria-label={`Unlink ${song.title} from this genre`}
        onClick={() => openDialog((close) => <UnlinkSongsPopup songs={[song.uuid]} onClose={close} />)}
        className={BUTTON}
      >
        ✕
      </button>
      <button
        type="button"
        aria-label={`Edit video of ${song.title}`}
        onClick={() => openDialog((close) => <SongVideoDialog song={song} onClose={close} />)}
        className={BUTTON}
      >
        ▶
      </button>
    </span>
  );
}
