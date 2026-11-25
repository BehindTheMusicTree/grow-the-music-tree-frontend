"use client";

import { PanelSection } from "@behindthemusictree/ui";
import { useFetchWrapper, useQueryWithParse } from "@behindthemusictree/app-kit/transport";
import { GenreHistorySchema, type GenreHistoryEntry } from "@schemas/api/genre-history";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

function describeEntry({ action, oldValue, newValue }: GenreHistoryEntry): string {
  switch (action) {
    case "renamed":
      return `Renamed ${oldValue} → ${newValue}`;
    case "parent_changed":
      return `Moved from ${oldValue ?? "root"} to ${newValue ?? "root"}`;
    case "side_changed":
      return `Side changed ${oldValue} → ${newValue}`;
    case "created":
      return "Created";
    case "excluded":
      return "Excluded";
    case "genre_changed":
      return "Genre changed";
    case "updated":
      return "Updated";
    case "deleted":
      return "Deleted";
    case "name_conflict_resolved":
      return "Name conflict resolved";
    case "root_accepted":
      return "Accepted as root";
  }
}

export default function GenreHistory({ genreUuid }: { genreUuid: string }) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const { data: entries, isPending, isError } = useQueryWithParse({
    queryKey: ["referenceGenres", "history", genreUuid],
    queryFn: () => fetch(`genres/${genreUuid}/history/`, true, false),
    schema: GenreHistorySchema,
    context: "GenreHistory",
  });

  return (
    <PanelSection title="Modifications">
      <div aria-busy={isPending}>
        {isPending ? (
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        ) : isError ? (
          <p className="text-red-600">Could not load modifications.</p>
        ) : entries.length === 0 ? (
          <p>—</p>
        ) : (
          <ol>
            {entries.map((entry) => (
              <li key={entry.uuid}>
                {describeEntry(entry)} by {entry.actorPseudo ?? "Pipeline"},{" "}
                <time dateTime={entry.createdOn}>{new Date(entry.createdOn).toLocaleDateString()}</time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </PanelSection>
  );
}
