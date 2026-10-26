"use client";

import type { CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useEssentialSongs } from "@hooks/curation/useEssentialSongs";

export default function EssentialSongsEditor({ overview }: { overview: CriteriaOverview }) {
  const { mutate, isPending } = useEssentialSongs();
  const tracks = overview.essentialSongs ?? [];

  const move = (from: number, to: number) => {
    if (to < 0 || to >= tracks.length) return;
    const next = [...tracks];
    next.splice(to, 0, next.splice(from, 1)[0]);
    mutate({ uuid: overview.uuid, tracks: next, previous: tracks });
  };

  if (tracks.length === 0) return <p className="text-sm text-gray-500">No essential songs yet. Use ☆ on a song.</p>;

  return (
    <ol className="flex flex-col gap-1">
      {tracks.map((track, index) => (
        <li
          key={track.uuid}
          tabIndex={0}
          onKeyDown={(event) => {
            if (!event.altKey) return;
            if (event.key === "ArrowUp") move(index, index - 1);
            if (event.key === "ArrowDown") move(index, index + 1);
          }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="flex-1">
            {index + 1}. {track.title}
          </span>
          <button
            type="button"
            aria-label={`Move ${track.title} up`}
            disabled={index === 0 || isPending}
            onClick={() => move(index, index - 1)}
            className="px-1 cursor-pointer disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label={`Move ${track.title} down`}
            disabled={index === tracks.length - 1 || isPending}
            onClick={() => move(index, index + 1)}
            className="px-1 cursor-pointer disabled:opacity-30"
          >
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}
