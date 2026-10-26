"use client";

import { genreQueryKeys, type CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { UpdateGenreNameInputSchema, UpdateGenreOutputSchema } from "@schemas/api/curation";

export function useUpdateGenreName() {
  return useCurationMutation({
    inputSchema: UpdateGenreNameInputSchema,
    outputSchema: UpdateGenreOutputSchema,
    request: (fetch, { uuid, name }) =>
      fetch(`genres/${uuid}/`, true, false, { method: "PUT", body: JSON.stringify({ name }) }),
    optimistic: (queryClient, { uuid, name }) => {
      const key = genreQueryKeys.reference.overview(uuid);
      queryClient.setQueryData(key, (data: CriteriaOverview | undefined) => (data ? { ...data, name } : data));
      return [key];
    },
    undo: ({ uuid, name, previous }) => ({ uuid, name: previous, previous: name }),
    message: ({ name }) => `Renamed to ${name}`,
    pendingLabel: ({ name }) => `Renaming to ${name}…`,
  });
}
