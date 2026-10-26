"use client";

import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { ExcludeGenreInputSchema, ExcludeGenreOutputSchema } from "@schemas/api/curation";

export function useExcludeGenre() {
  return useCurationMutation({
    inputSchema: ExcludeGenreInputSchema,
    outputSchema: ExcludeGenreOutputSchema,
    request: (fetch, { uuid, category }) =>
      fetch(`genres/${uuid}/exclude/`, true, false, { method: "POST", body: JSON.stringify({ category }) }),
    message: () => "Genre excluded",
    pendingLabel: () => "Excluding genre…",
  });
}
