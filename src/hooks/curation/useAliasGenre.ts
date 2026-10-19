"use client";

import { useQuery } from "@tanstack/react-query";
import { useFetchWrapper } from "@behindthemusictree/app-kit/transport";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { AliasGenreInputSchema, AliasGenreOutputSchema, AliasPreviewSchema } from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export function useAliasPreview(uuid: string, target: string | null) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  return useQuery({
    queryKey: ["referenceGenres", "aliasPreview", uuid, target],
    enabled: target !== null,
    queryFn: async () =>
      AliasPreviewSchema.parse(await fetch(`genres/${uuid}/alias-of/preview/`, true, false, {}, { target: target ?? "" })),
  });
}

export function useAliasGenre() {
  return useCurationMutation({
    inputSchema: AliasGenreInputSchema,
    outputSchema: AliasGenreOutputSchema,
    request: (fetch, { uuid, target }) =>
      fetch(`genres/${uuid}/alias-of/`, true, false, { method: "POST", body: JSON.stringify({ target }) }),
    message: () => "Genre merged into its alias target",
  });
}
