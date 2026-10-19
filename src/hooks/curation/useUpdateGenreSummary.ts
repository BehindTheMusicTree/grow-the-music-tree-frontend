"use client";

import { genreQueryKeys, type CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { UpdateGenreOutputSchema, UpdateGenreSummaryInputSchema } from "@schemas/api/curation";

export function useUpdateGenreSummary() {
  return useCurationMutation({
    inputSchema: UpdateGenreSummaryInputSchema,
    outputSchema: UpdateGenreOutputSchema,
    request: (fetch, { uuid, summary }) =>
      fetch(`genres/${uuid}/`, true, false, { method: "PUT", body: JSON.stringify({ summary }) }),
    optimistic: (queryClient, { uuid, summary }) => {
      queryClient.setQueryData(genreQueryKeys.reference.overview(uuid), (data: CriteriaOverview | undefined) =>
        data ? { ...data, summary } : data,
      );
    },
    undo: ({ uuid, summary, previous }) => ({ uuid, summary: previous, previous: summary }),
    message: () => "Summary saved",
  });
}
