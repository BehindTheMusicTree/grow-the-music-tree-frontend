"use client";

import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { BasePopup } from "@behindthemusictree/app-kit/popup";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { RingLoader } from "@behindthemusictree/ui";
import { useAssignRecordingGenre } from "@hooks/curation/useAssignRecordingGenre";
import { useDebouncedValue } from "@hooks/useDebouncedValue";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  LinkSuggestionsSchema,
  RecordingSearchSchema,
  type LinkCandidate,
} from "@schemas/api/curation";
import type { CuratedGenre } from "@components/features/genre-curation/GenreCurationProvider";

type Tab = "suggested" | "search";

function CandidateRow({
  candidate,
  checked,
  onToggle,
}: {
  candidate: LinkCandidate;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center gap-2 py-1">
      <input
        type="checkbox"
        id={`link-${candidate.uuid}`}
        checked={checked}
        onChange={onToggle}
        aria-label={`Link ${candidate.title}`}
      />
      <label htmlFor={`link-${candidate.uuid}`} className="flex-1 cursor-pointer">
        {candidate.title}
        {candidate.artists?.length ? ` — ${candidate.artists.map((artist) => artist.name).join(", ")}` : ""}
      </label>
      {candidate.genre && <span className="text-xs text-gray-500">already in {candidate.genre.name}</span>}
    </li>
  );
}

export default function LinkRecordingsDialog({ genre, onClose }: { genre: CuratedGenre; onClose: () => void }) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [tab, setTab] = useState<Tab>("suggested");
  const [text, setText] = useState("");
  const [genreless, setGenreless] = useState(true);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const query = useDebouncedValue(text.trim(), 300);
  const { mutate, isPending } = useAssignRecordingGenre(`linked to ${genre.name}`);

  const suggestions = useQuery({
    queryKey: ["referenceRecordings", "linkSuggestions", genre.uuid],
    enabled: tab === "suggested",
    queryFn: async () =>
      LinkSuggestionsSchema.parse(await fetch(`genres/${genre.uuid}/link-suggestions/`, true, false)),
  });
  const search = useInfiniteQuery({
    queryKey: ["referenceRecordings", "linkSearch", query, genreless],
    enabled: tab === "search" && query.length >= 2,
    initialPageParam: "",
    queryFn: async ({ pageParam }) =>
      RecordingSearchSchema.parse(
        await fetch("library/recordings/search/", true, false, {}, { q: query, genreless, cursor: pageParam }),
      ),
    getNextPageParam: (last) => last.next ?? undefined,
  });

  const candidates = tab === "suggested" ? (suggestions.data ?? []) : (search.data?.pages.flatMap((p) => p.results) ?? []);
  const loading = tab === "suggested" ? suggestions.isLoading : search.isFetching && !search.isFetchingNextPage;
  const toggle = (uuid: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (!next.delete(uuid)) next.add(uuid);
      return next;
    });

  return (
    <BasePopup
      title={`Link recordings to ${genre.name}`}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText={`Link ${checked.size || ""}`.trim()}
      okButtonDisabled={checked.size === 0 || isPending}
      onOk={() => {
        mutate({ recordings: Array.from(checked), genre: genre.uuid });
        onClose();
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 min-w-[320px]">
        <div role="tablist" className="flex gap-2">
          {(["suggested", "search"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className="px-3 py-1 text-sm capitalize border-b-2 border-transparent cursor-pointer aria-selected:border-blue-600"
            >
              {name}
            </button>
          ))}
        </div>
        {tab === "search" && (
          <div className="flex flex-col gap-2">
            <input
              type="search"
              aria-label="Search recordings"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={genreless} onChange={(event) => setGenreless(event.target.checked)} />
              Only genreless
            </label>
          </div>
        )}
        {loading && <RingLoader />}
        <ul className="max-h-72 overflow-y-auto">
          {candidates.map((candidate) => (
            <CandidateRow
              key={candidate.uuid}
              candidate={candidate}
              checked={checked.has(candidate.uuid)}
              onToggle={() => toggle(candidate.uuid)}
            />
          ))}
        </ul>
        {tab === "search" && search.hasNextPage && (
          <button
            type="button"
            className="self-start px-3 py-1 text-sm border rounded cursor-pointer hover:bg-gray-100"
            onClick={() => search.fetchNextPage()}
          >
            More results
          </button>
        )}
      </div>
    </BasePopup>
  );
}
