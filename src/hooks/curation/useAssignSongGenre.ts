"use client";

import { editGenreSongPages, libraryQueryKeys } from "@behindthemusictree/app-kit/genre-tree";
import { useCurationMutation } from "@hooks/curation/useCurationMutation";
import { AssignSongGenreInputSchema, AssignSongGenreOutputSchema } from "@schemas/api/curation";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export function useAssignSongGenre(label: string) {
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
    undo: (input, output) => {
      if (output.previous.some((entry) => !entry.undoable)) return null;
      const genres = Array.from(new Set(output.previous.map((entry) => entry.genre)));
      return genres.length === 1 ? { songs: input.songs, genre: genres[0] } : null;
    },
    message: (input) => `${input.songs.length} song${input.songs.length > 1 ? "s" : ""} ${label}`,
    pendingLabel: (input) => `Updating ${input.songs.length} song${input.songs.length > 1 ? "s" : ""}…`,
  });
}
