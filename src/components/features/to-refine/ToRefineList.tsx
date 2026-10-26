"use client";

import { useState } from "react";
import { z } from "zod";
import { keepPreviousData } from "@tanstack/react-query";
import { Pagination } from "@behindthemusictree/ui";
import { PaginatedResponseSchema, useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import GenrePicker from "@components/features/curation/GenrePicker";
import { useAssignSongGenre } from "@hooks/curation/useAssignSongGenre";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

const ToRefineSongSchema = z.object({
  uuid: z.string().uuid(),
  title: z.string(),
  genre: z.object({ name: z.string() }).nullable(),
});

type ToRefineSong = z.infer<typeof ToRefineSongSchema>;

const ToRefinePageSchema = PaginatedResponseSchema(ToRefineSongSchema);

function ToRefineRow({ song }: { song: ToRefineSong }) {
  const [target, setTarget] = useState<{ uuid: string; name: string } | null>(null);
  const { mutate, isPending } = useAssignSongGenre("refined");

  return (
    <li className="flex flex-wrap items-end gap-4 rounded-md border p-4">
      <div className="flex min-w-48 flex-col">
        <span className="font-medium">{song.title}</span>
        <span className="text-sm text-gray-600">{song.genre?.name}</span>
      </div>
      <div className="min-w-64 flex-1">
        <GenrePicker
          label={`Sous-genre de ${song.title}`}
          value={target?.name ?? ""}
          defaultText=""
          excludeUmbrellas
          onChange={(_itemId, name, uuid) => setTarget(uuid && name ? { uuid, name } : null)}
        />
      </div>
      <button
        type="button"
        className="rounded border bg-white px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
        disabled={!target || isPending}
        onClick={() => target && mutate({ songs: [song.uuid], genre: target.uuid })}
      >
        Affiner
      </button>
    </li>
  );
}

export default function ToRefineList() {
  const [page, setPage] = useState(1);
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data, isPending, isError } = useQueryWithParse({
    queryKey: ["toRefineSongs", page],
    queryFn: () => fetch("library/songs/", true, false, undefined, { genreIsUmbrella: true, page }),
    schema: ToRefinePageSchema,
    placeholderData: keepPreviousData,
    context: "ToRefineList",
  });

  if (isPending) return <div className="h-14 animate-pulse rounded bg-gray-200" aria-busy="true" />;
  if (isError) return <p className="text-red-600">Impossible de charger les chansons.</p>;
  if (data.results.length === 0) return <p>Rien à affiner</p>;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {data.results.map((song) => (
          <ToRefineRow key={song.uuid} song={song} />
        ))}
      </ul>
      <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
