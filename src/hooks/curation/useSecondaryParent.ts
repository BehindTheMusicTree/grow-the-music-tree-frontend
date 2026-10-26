"use client";

import { useQuery } from "@tanstack/react-query";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { GenreTreeRowsSchema, SecondaryParentInputSchema, SecondaryParentOutputSchema } from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export const secondaryParentsKey = (genreUuid: string) => ["referenceGenrePlaylists", "secondaryParents", genreUuid];

export function useSecondaryParents(genreUuid: string) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQuery({
    queryKey: secondaryParentsKey(genreUuid),
    queryFn: async () => {
      const rows = GenreTreeRowsSchema.parse(await fetch("genre-playlists/tree/", true, false, {}, { tree_name: "canonical" }));
      return rows.find((row) => row.criteria?.uuid === genreUuid)?.criteria?.secondaryParents ?? [];
    },
  });
}

export function useSecondaryParent() {
  return useCurationMutation({
    inputSchema: SecondaryParentInputSchema,
    outputSchema: SecondaryParentOutputSchema,
    request: (fetch, { uuid, parent, add }) =>
      fetch(`genres/${uuid}/secondary-parents/${parent.uuid}/`, true, false, { method: add ? "POST" : "DELETE" }),
    optimistic: (queryClient, { uuid, parent, add }) => {
      queryClient.setQueryData(secondaryParentsKey(uuid), (current: { uuid: string; name: string }[] | undefined) =>
        add ? [...(current ?? []), parent] : (current ?? []).filter((entry) => entry.uuid !== parent.uuid),
      );
      return [secondaryParentsKey(uuid)];
    },
    undo: (input) => ({ ...input, add: !input.add }),
    message: ({ parent, add }) => (add ? `Also under ${parent.name}` : `Removed from ${parent.name}`),
    pendingLabel: ({ parent, add }) => (add ? `Adding under ${parent.name}…` : `Removing from ${parent.name}…`),
  });
}
