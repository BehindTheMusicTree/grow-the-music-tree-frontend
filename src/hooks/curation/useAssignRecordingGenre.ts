"use client";

import { editGenreRecordingPages, libraryQueryKeys } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { AssignRecordingGenreInputSchema, AssignRecordingGenreOutputSchema } from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export function useAssignRecordingGenre(label: string) {
  return useCurationMutation({
    inputSchema: AssignRecordingGenreInputSchema,
    outputSchema: AssignRecordingGenreOutputSchema,
    request: (fetch, input) =>
      fetch("library/recordings/assign-genre/", true, false, { method: "POST", body: JSON.stringify(input) }),
    optimistic: (queryClient, input) => {
      if (input.genre !== null) return [];
      const moved = new Set(input.recordings);
      const prefix = libraryQueryKeys.reference.recordings.all[0];
      const keys = queryClient.getQueriesData({ queryKey: [prefix, getGrowBackendBaseUrl(), "genre"] }).map(([key]) => key);
      keys.forEach((key) =>
        queryClient.setQueryData<Parameters<typeof editGenreRecordingPages>[0]>(key, (data) =>
          editGenreRecordingPages(data, (tracks) => tracks.filter((track) => !moved.has((track as { uuid: string }).uuid))),
        ),
      );
      return keys;
    },
    undo: (input, output) => {
      if (output.previous.some((entry) => !entry.undoable)) return null;
      const genres = Array.from(new Set(output.previous.map((entry) => entry.genre)));
      return genres.length === 1 ? { recordings: input.recordings, genre: genres[0] } : null;
    },
    message: (input) => `${input.recordings.length} recording${input.recordings.length > 1 ? "s" : ""} ${label}`,
    pendingLabel: (input) => `Updating ${input.recordings.length} recording${input.recordings.length > 1 ? "s" : ""}…`,
  });
}
