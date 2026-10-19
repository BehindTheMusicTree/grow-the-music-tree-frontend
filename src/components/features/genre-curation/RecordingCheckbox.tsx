"use client";

import type { TrackBase } from "@behindthemusictree/app-kit/genre-tree";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";

export default function RecordingCheckbox({ recording, index }: { recording: TrackBase; index: number }) {
  const { selected, toggle, registerRow } = useGenreCuration();
  registerRow(index, recording.uuid);
  return (
    <input
      type="checkbox"
      aria-label={`Select ${recording.title}`}
      checked={selected.has(recording.uuid)}
      readOnly
      onClick={(event) => toggle(recording.uuid, index, event.shiftKey)}
      className="cursor-pointer"
    />
  );
}
