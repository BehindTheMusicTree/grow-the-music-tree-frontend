"use client";

import { useEffect } from "react";
import type { TrackBase } from "@behindthemusictree/app-kit/genre-tree";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";

export default function SongCheckbox({ song, index }: { song: TrackBase; index: number }) {
  const { selected, toggle, registerRow } = useGenreCuration();
  useEffect(() => registerRow(index, song.uuid), [registerRow, index, song.uuid]);
  return (
    <input
      type="checkbox"
      aria-label={`Select ${song.title}`}
      checked={selected.has(song.uuid)}
      readOnly
      onClick={(event) => toggle(song.uuid, index, event.shiftKey)}
      className="cursor-pointer"
    />
  );
}
