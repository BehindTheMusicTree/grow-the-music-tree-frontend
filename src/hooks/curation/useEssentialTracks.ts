"use client";

import { genreQueryKeys, type CriteriaOverview } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { UpdateEssentialTracksInputSchema, UpdateGenreOutputSchema } from "@schemas/api/curation";

export function useEssentialTracks() {
  return useCurationMutation({
    inputSchema: UpdateEssentialTracksInputSchema,
    outputSchema: UpdateGenreOutputSchema,
    request: (fetch, { uuid, tracks }) =>
      fetch(`genres/${uuid}/`, true, false, {
        method: "PUT",
        body: JSON.stringify({ essentialTracks: tracks.map((track) => track.uuid) }),
      }),
    optimistic: (queryClient, { uuid, tracks }) => {
      queryClient.setQueryData(genreQueryKeys.reference.overview(uuid), (data: CriteriaOverview | undefined) =>
        data ? { ...data, essentialTracks: tracks } : data,
      );
    },
    undo: ({ uuid, tracks, previous }) => ({ uuid, tracks: previous, previous: tracks }),
    message: () => "Essential tracks updated",
  });
}
