"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BasePopup } from "@behindthemusictree/app-kit-ui/popup";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { useSongSearch } from "@behindthemusictree/app-kit/genre-tree";
import { RingLoader } from "@behindthemusictree/ui";
import { useAssignSongGenre } from "@hooks/curation/useAssignSongGenre";
import { BANNER_HEIGHT } from "@lib/constants/layout";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { LinkSuggestionsSchema, type LinkCandidate } from "@schemas/api/curation";
import type { CuratedGenre } from "@components/features/genre-curation/GenreCurationProvider";

type Tab = "suggested" | "search";

const SEARCH_LIMIT = 50;

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
      {candidate.genre && <span className="text-caption text-gray-500">already in {candidate.genre.name}</span>}
    </li>
  );
}

export default function LinkSongsDialog({ genre, onClose }: { genre: CuratedGenre; onClose: () => void }) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [tab, setTab] = useState<Tab>("suggested");
  const [text, setText] = useState("");
  const [genreless, setGenreless] = useState(true);
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const { mutate, isPending } = useAssignSongGenre(`linked to ${genre.name}`);

  const suggestions = useQuery({
    queryKey: ["referenceSongs", "linkSuggestions", genre.uuid],
    enabled: tab === "suggested",
    queryFn: async () =>
      LinkSuggestionsSchema.parse(await fetch(`genres/${genre.uuid}/link-suggestions/`, true, false)),
  });
  const search = useSongSearch(getGrowBackendBaseUrl, text.trim(), {
    limit: SEARCH_LIMIT,
    genre: genreless ? "without" : "any",
  });

  const candidates = tab === "suggested" ? (suggestions.data ?? []) : search.songs;
  const loading = tab === "suggested" ? suggestions.isLoading : search.pending;
  const toggle = (uuid: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (!next.delete(uuid)) next.add(uuid);
      return next;
    });

  return (
    <BasePopup
      title={`Link songs to ${genre.name}`}
      topOffset={BANNER_HEIGHT}
      isDismissable
      showOkButton
      showCancelButton
      okButtonText={`Link ${checked.size || ""}`.trim()}
      okButtonDisabled={checked.size === 0 || isPending}
      onOk={() => {
        mutate({ songs: Array.from(checked), genre: genre.uuid }, { onSuccess: onClose });
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
              className="px-3 py-1 text-body capitalize border-b-2 border-transparent cursor-pointer aria-selected:border-blue-600"
            >
              {name}
            </button>
          ))}
        </div>
        {tab === "search" && (
          <div className="flex flex-col gap-2">
            <input
              type="search"
              aria-label="Search songs"
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <label className="flex items-center gap-2 text-body">
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
      </div>
    </BasePopup>
  );
}
