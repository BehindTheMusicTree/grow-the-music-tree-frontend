"use client";

import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { UpdateGenreOutputSchema, UpdateGenreParentInputSchema } from "@schemas/api/curation";

export function useUpdateGenreParent() {
  return useCurationMutation({
    inputSchema: UpdateGenreParentInputSchema,
    outputSchema: UpdateGenreOutputSchema,
    request: (fetch, { uuid, parent }) =>
      fetch(`genres/${uuid}/`, true, false, { method: "PUT", body: JSON.stringify({ parent: parent.uuid }) }),
    undo: ({ uuid, parent, previous }) => (previous ? { uuid, parent: previous, previous: parent } : null),
    message: ({ parent }) => `Moved under ${parent.name}`,
  });
}
