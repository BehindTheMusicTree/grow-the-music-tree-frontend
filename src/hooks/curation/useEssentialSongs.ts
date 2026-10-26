"use client";

import { genreQueryKeys, type CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { UpdateEssentialSongsInputSchema, UpdateGenreOutputSchema } from "@schemas/api/curation";

export function useEssentialSongs() {
  return useCurationMutation({
    inputSchema: UpdateEssentialSongsInputSchema,
    outputSchema: UpdateGenreOutputSchema,
    request: (fetch, { uuid, tracks }) =>
      fetch(`genres/${uuid}/`, true, false, {
        method: "PUT",
        body: JSON.stringify({ essentialSongs: tracks.map((track) => track.uuid) }),
      }),
    optimistic: (queryClient, { uuid, tracks }) => {
      const key = genreQueryKeys.reference.overview(uuid);
      queryClient.setQueryData(key, (data: CriteriaOverview | undefined) => (data ? { ...data, essentialSongs: tracks } : data));
      return [key];
    },
    undo: ({ uuid, tracks, previous }) => ({ uuid, tracks: previous, previous: tracks }),
    message: () => "Essential songs updated",
    pendingLabel: () => "Saving essential songs…",
  });
}
