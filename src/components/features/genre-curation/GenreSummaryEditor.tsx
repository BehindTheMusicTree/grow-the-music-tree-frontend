"use client";

import { useEffect, useRef, useState } from "react";
import type { CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useGenreCuration } from "@components/features/genre-curation/GenreCurationProvider";
import { useUpdateGenreSummary } from "@hooks/curation/useUpdateGenreSummary";

export default function GenreSummaryEditor({ overview }: { overview: CriteriaOverview }) {
  const { setGenre } = useGenreCuration();
  const [text, setText] = useState(overview.summary ?? "");
  const { mutate } = useUpdateGenreSummary();
  const focused = useRef(false);

  useEffect(() => setGenre({ uuid: overview.uuid, name: overview.name }), [overview.uuid, overview.name, setGenre]);
  useEffect(() => {
    if (!focused.current) setText(overview.summary ?? "");
  }, [overview.summary]);

  return (
    <textarea
      aria-label="Genre summary"
      value={text}
      rows={4}
      onChange={(event) => setText(event.target.value)}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        if (text !== (overview.summary ?? "")) mutate({ uuid: overview.uuid, summary: text, previous: overview.summary ?? "" });
      }}
      className="w-full px-2 py-1 text-sm border rounded-md"
    />
  );
}
