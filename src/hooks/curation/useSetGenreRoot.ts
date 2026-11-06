"use client";

import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { SetGenreRootInputSchema, SetGenreRootOutputSchema } from "@schemas/api/curation";

// No undo: moving it back under a parent would leave its accepted-root rule behind, which the pipeline rejects.
export function useSetGenreRoot() {
  return useCurationMutation({
    inputSchema: SetGenreRootInputSchema,
    outputSchema: SetGenreRootOutputSchema,
    request: (fetch, { uuid }) => fetch(`genres/${uuid}/set-root/`, true, false, { method: "POST" }),
    message: ({ name }) => `Made ${name} a root`,
    pendingLabel: ({ name }) => `Making ${name} a root…`,
  });
}
