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
      const moved = new Set(input.recordings);
      const prefix = libraryQueryKeys.reference.recordings.all[0];
      queryClient.getQueriesData({ queryKey: [prefix, getGrowBackendBaseUrl(), "genre"] }).forEach(([key]) => {
        if (key[3] === input.genre) return;
        queryClient.setQueryData(key, (data: Parameters<typeof editGenreRecordingPages>[0]) =>
          editGenreRecordingPages(data, (tracks) => tracks.filter((track) => !moved.has((track as { uuid: string }).uuid))),
        );
      });
    },
    undo: (input, output) => {
      const genres = Array.from(new Set(output.previous.map((entry) => entry.genre)));
      return genres.length === 1 ? { recordings: input.recordings, genre: genres[0] } : null;
    },
    message: (input) => `${input.recordings.length} recording${input.recordings.length > 1 ? "s" : ""} ${label}`,
  });
}
