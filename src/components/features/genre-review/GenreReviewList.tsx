"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import type { GenreNameConflictGroup } from "@schemas/api/genre-name-conflicts";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

const ValidateGroupInputSchema = z.object({
  genres: z.array(z.object({ uuid: z.string(), name: z.string() })),
});

function GenreConflictGroupCard({ group }: { group: GenreNameConflictGroup }) {
  const router = useRouter();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const [names, setNames] = useState(() => Object.fromEntries(group.genres.map((genre) => [genre.uuid, genre.name])));
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema: ValidateGroupInputSchema,
    outputSchema: z.null(),
    mutationFn: (data) =>
      fetch("genres/name-conflicts/validate/", true, false, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => router.refresh(),
  });

  const validate = () => mutate({ genres: Object.entries(names).map(([uuid, name]) => ({ uuid, name })) });
  const groupErrors = formErrors.filter((error) => !(error.field in names));

  return (
    <section className="flex flex-col gap-3 rounded-md border p-4" aria-label={group.name}>
      <h2 className="font-medium">{group.name}</h2>
      {group.genres.map((genre) => (
        <div key={genre.uuid} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              aria-label={`Name of ${genre.name}`}
              value={names[genre.uuid]}
              onChange={(e) => setNames((current) => ({ ...current, [genre.uuid]: e.target.value }))}
              className="w-72 rounded-md border px-3 py-1"
            />
            <span>Parent: {genre.parent?.name ?? "—"}</span>
            {genre.wikidataId && (
              <a
                href={`https://www.wikidata.org/wiki/${genre.wikidataId}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {genre.wikidataId}
              </a>
            )}
            {genre.hasNameConflict && <span className="text-sm text-amber-600">flagged</span>}
          </div>
          {formErrors
            .filter((error) => error.field === genre.uuid)
            .map((error, index) => (
              <p key={index} className="text-red-500">
                {error.message}
              </p>
            ))}
        </div>
      ))}
      {groupErrors.map((error, index) => (
        <p key={index} className="text-red-500">
          {error.message}
        </p>
      ))}
      <div>
        <Button onClick={validate} disabled={isPending}>
          Validate
        </Button>
      </div>
    </section>
  );
}

export default function GenreReviewList({ groups }: { groups: GenreNameConflictGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <GenreConflictGroupCard key={group.genres.map((genre) => genre.uuid).join()} group={group} />
      ))}
    </div>
  );
}
