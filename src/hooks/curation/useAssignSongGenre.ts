"use client";

import { z } from "zod";
import { editGenreSongPages, libraryQueryKeys } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { AssignSongGenreInputSchema, AssignSongGenreOutputSchema, UndoSongGenreInputSchema } from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export function useAssignSongGenre(label: string) {
  const undoAssignment = useCurationMutation({
    inputSchema: UndoSongGenreInputSchema,
    outputSchema: z.null(),
    request: async (_fetch, input) => {
      const response = await fetch(`${getGrowBackendBaseUrl()}/library/songs/assign-genre/undo/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (response.status === 409) {
        throw new Error("A song changed since this edit. Reload to see the current genres.");
      }
      if (response.status === 404) {
        throw new Error("This edit can no longer be undone.");
      }
      if (response.status !== 204) {
        throw new Error("Could not undo the song genre changes.");
      }
      return null;
    },
    message: () => "Song genre changes restored",
    pendingLabel: () => "Restoring song genres…",
  });

  return useCurationMutation({
    inputSchema: AssignSongGenreInputSchema,
    outputSchema: AssignSongGenreOutputSchema,
    request: (fetch, input) =>
      fetch("library/songs/assign-genre/", true, false, { method: "POST", body: JSON.stringify(input) }),
    optimistic: (queryClient, input) => {
      if (input.genre !== null) return [];
      const moved = new Set(input.songs);
      const prefix = libraryQueryKeys.reference.songs.all[0];
      const keys = queryClient.getQueriesData({ queryKey: [prefix, getGrowBackendBaseUrl(), "genre"] }).map(([key]) => key);
      keys.forEach((key) =>
        queryClient.setQueryData<Parameters<typeof editGenreSongPages>[0]>(key, (data) =>
          editGenreSongPages(data, (tracks) => tracks.filter((track) => !moved.has((track as { uuid: string }).uuid))),
        ),
      );
      return keys;
    },
    undoAction: ({ undoToken }) => (undoToken ? () => undoAssignment.mutate({ undoToken }) : undefined),
    undo: (input, output) => {
      if (output.undoToken !== undefined || output.previous.some((entry) => !entry.undoable)) return null;
      const genres = Array.from(new Set(output.previous.map((entry) => entry.genre)));
      return genres.length === 1 ? { songs: input.songs, genre: genres[0] } : null;
    },
    message: (input) => `${input.songs.length} song${input.songs.length > 1 ? "s" : ""} ${label}`,
    pendingLabel: (input) => `Updating ${input.songs.length} song${input.songs.length > 1 ? "s" : ""}…`,
  });
}
